package data

import (
	"context"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/vcokltfre/packlog/src/backend/data/database"
)

type DB struct {
	*database.Queries
	Conn *pgxpool.Pool
}

func Connect(url string) (*DB, error) {
	conf, err := pgxpool.ParseConfig(url)
	if err != nil {
		return nil, err
	}

	pool, err := pgxpool.NewWithConfig(context.TODO(), conf)
	if err != nil {
		return nil, err
	}

	if err := pool.Ping(context.TODO()); err != nil {
		return nil, err
	}

	return &DB{
		Queries: database.New(pool),
		Conn:    pool,
	}, nil
}

func IsNotFoundError(err error) bool {
	return strings.Contains(err.Error(), "no rows in result set")
}

func IsUniqueViolationError(err error) bool {
	return strings.Contains(err.Error(), "duplicate key value violates unique constraint")
}

func PacklogDate(t time.Time) time.Time {
	year, month, day := t.Date()
	return time.Date(year, month, day, 0, 0, 0, 0, time.FixedZone("UTC", 0))
}

func ParsePacklogDate(s string) (time.Time, error) {
	return time.Parse("2006-01-02", s)
}
