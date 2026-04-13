package invites

import (
	"github.com/labstack/echo/v4"
	"github.com/vcokltfre/packlog/src/backend/auth"
)

func Register(e *echo.Echo) {
	e.POST("/api/invites", createInvite, auth.AuthenticatedRoute)
	e.POST("/api/invites/:code/accept", acceptInvite)
	e.DELETE("/api/invites/:code", deleteInvite, auth.AuthenticatedRoute)
	e.GET("/api/invites", listInvites, auth.AuthenticatedRoute)
}
