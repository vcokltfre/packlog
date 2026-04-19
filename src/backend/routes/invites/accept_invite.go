package invites

import (
	"github.com/labstack/echo/v4"
	"github.com/vcokltfre/packlog/src/backend/auth"
	"github.com/vcokltfre/packlog/src/backend/data"
)

type acceptInviteRequest struct {
	Password string `json:"password"`
}

func acceptInvite(c echo.Context) error {
	code := c.Param("code")

	req := &acceptInviteRequest{}
	if err := c.Bind(req); err != nil {
		return c.JSON(400, map[string]string{"error": "Invalid request body"})
	}

	db := c.Get("db").(*data.DB)
	am := c.Get("auth").(*auth.AuthManager)

	invite, err := db.GetInviteByCode(c.Request().Context(), code)
	if err != nil {
		return c.JSON(400, map[string]string{"error": "Invalid invite code"})
	}

	u, err := db.GetUserByUsername(c.Request().Context(), invite.Username)
	if err == nil {
		if err := am.UpdatePassword(c.Request().Context(), u.Username, req.Password); err != nil {
			return c.JSON(500, map[string]string{"error": "Failed to update password"})
		}

		if err := db.DeleteInvite(c.Request().Context(), code); err != nil {
			return c.JSON(500, map[string]string{"error": "Failed to delete invite"})
		}

		return c.NoContent(204)
	}

	if err := am.CreateUser(c.Request().Context(), invite.Username, req.Password); err != nil {
		return c.JSON(500, map[string]string{"error": "Failed to create user"})
	}

	if err := db.DeleteInvite(c.Request().Context(), code); err != nil {
		return c.JSON(500, map[string]string{"error": "Failed to delete invite"})
	}

	return c.NoContent(204)
}
