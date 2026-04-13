package users

import (
	"github.com/labstack/echo/v4"
	"github.com/vcokltfre/packlog/src/backend/auth"
)

func Register(e *echo.Echo) {
	e.POST("/api/users/start-session", startSession)
	e.POST("/api/users/check-session", checkSession, auth.AuthenticatedRoute)
	e.GET("/api/users/@self", getSelf, auth.AuthenticatedRoute)
}
