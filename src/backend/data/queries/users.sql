-- name: CreateUser :exec
INSERT INTO users (username, password) VALUES ($1, $2);

-- name: UpdatePassword :exec
UPDATE users SET password = $2 WHERE username = $1;

-- name: GrantAdmin :exec
UPDATE users SET admin = TRUE WHERE username = $1;

-- name: RevokeAdmin :exec
UPDATE users SET admin = FALSE WHERE username = $1;

-- name: DeleteUser :exec
DELETE FROM users WHERE username = $1;

-- name: GetUserByUsername :one
SELECT username, password, admin FROM users WHERE username = $1;

-- name: ListUsers :many
SELECT username, admin FROM users;

-- name: CreateInvite :exec
INSERT INTO invites (code, username) VALUES ($1, $2);

-- name: GetInviteByCode :one
SELECT code, username FROM invites WHERE code = $1;

-- name: DeleteInvite :exec
DELETE FROM invites WHERE code = $1;

-- name: ListInvites :many
SELECT code, username FROM invites;
