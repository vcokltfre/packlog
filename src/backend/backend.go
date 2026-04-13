package backend

import (
	"github.com/labstack/echo/v4"
	"github.com/sirupsen/logrus"
	"github.com/vcokltfre/packlog/src/backend/auth"
	"github.com/vcokltfre/packlog/src/backend/data"
	"github.com/vcokltfre/packlog/src/backend/routes/invites"
	"github.com/vcokltfre/packlog/src/backend/routes/packlogs"
	"github.com/vcokltfre/packlog/src/backend/routes/users"
	"github.com/vcokltfre/packlog/src/dashboard"
)

func Start(bind, externalUrl string, db *data.DB, am *auth.AuthManager) error {
	e := echo.New()

	e.HideBanner = true
	e.HidePort = true

	e.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			c.Response().Header().Set("Access-Control-Allow-Origin", externalUrl)
			c.Response().Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			c.Response().Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			c.Response().Header().Set("Access-Control-Allow-Credentials", "true")

			return next(c)
		}
	})

	e.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			c.Set("auth", am)
			c.Set("db", db)
			return next(c)
		}
	})

	e.Use(dashboard.Serve)

	users.Register(e)
	invites.Register(e)
	packlogs.Register(e)

	logrus.Info("Starting Packlog backend on ", bind)

	return e.Start(bind)
}
