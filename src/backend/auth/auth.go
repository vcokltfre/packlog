package auth

import (
	"context"
	"crypto/rand"
	"errors"
	"fmt"
	"strings"
	"sync"

	"github.com/vcokltfre/packlog/src/backend/data"
	"github.com/vcokltfre/packlog/src/backend/data/database"
)

func normalizeUsername(username string) string {
	return strings.ToLower(username)
}

type AuthManager struct {
	db *data.DB

	sessions   map[string]string
	sessionsMx *sync.RWMutex
}

func (am *AuthManager) CreateUser(ctx context.Context, username, password string) error {
	username = normalizeUsername(username)

	hash, err := hashPassword(password)
	if err != nil {
		return err
	}

	if err := am.db.CreateUser(ctx, database.CreateUserParams{
		Username: username,
		Password: hash,
	}); err != nil {
		return err
	}

	return nil
}

func (am *AuthManager) UpdatePassword(ctx context.Context, username, newPassword string) error {
	username = normalizeUsername(username)

	hash, err := hashPassword(newPassword)
	if err != nil {
		return err
	}

	if err := am.db.UpdatePassword(ctx, database.UpdatePasswordParams{
		Username: username,
		Password: hash,
	}); err != nil {
		return err
	}

	return nil
}

func (am *AuthManager) DeleteUser(ctx context.Context, username string) error {
	username = normalizeUsername(username)

	user, err := am.db.GetUserByUsername(ctx, username)
	if err != nil {
		return err
	}

	if err := am.db.DeleteUser(ctx, user.Username); err != nil {
		return err
	}

	return nil
}

func (am *AuthManager) GrantAdmin(ctx context.Context, username string) error {
	username = normalizeUsername(username)

	user, err := am.db.GetUserByUsername(ctx, username)
	if err != nil {
		return err
	}

	if err := am.db.GrantAdmin(ctx, user.Username); err != nil {
		return err
	}

	return nil
}

func (am *AuthManager) RevokeAdmin(ctx context.Context, username string) error {
	username = normalizeUsername(username)

	user, err := am.db.GetUserByUsername(context.TODO(), username)
	if err != nil {
		return err
	}

	if err := am.db.RevokeAdmin(ctx, user.Username); err != nil {
		return err
	}

	return nil
}

func (am *AuthManager) ListUsers(ctx context.Context) ([]string, error) {
	users, err := am.db.ListUsers(ctx)
	if err != nil {
		return nil, err
	}

	usernames := make([]string, len(users))
	for i, user := range users {
		usernames[i] = user.Username
	}

	return usernames, nil
}

func (am *AuthManager) IsAdmin(ctx context.Context, username string) (bool, error) {
	username = normalizeUsername(username)

	user, err := am.db.GetUserByUsername(ctx, username)
	if err != nil {
		return false, err
	}

	return user.Admin, nil
}

func (am *AuthManager) Authenticate(ctx context.Context, username, password string) (string, error) {
	username = normalizeUsername(username)

	user, err := am.db.GetUserByUsername(ctx, username)
	if err != nil {
		return "", err
	}

	if !checkPasswordHash(password, user.Password) {
		return "", errors.New("invalid credentials")
	}

	sessionBytes := make([]byte, 16)
	if _, err := rand.Read(sessionBytes); err != nil {
		return "", err
	}

	session := fmt.Sprintf("%x", sessionBytes)

	am.sessionsMx.Lock()
	am.sessions[session] = user.Username
	am.sessionsMx.Unlock()

	return session, nil
}

func (am *AuthManager) GetUsernameBySession(session string) (string, error) {
	am.sessionsMx.RLock()
	username, ok := am.sessions[session]
	am.sessionsMx.RUnlock()

	if !ok {
		return "", errors.New("invalid session")
	}

	return username, nil
}

func NewAuthManager(db *data.DB) *AuthManager {
	return &AuthManager{
		db:         db,
		sessions:   make(map[string]string),
		sessionsMx: &sync.RWMutex{},
	}
}
