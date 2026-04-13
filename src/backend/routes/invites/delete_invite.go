package invites

import (
	"github.com/labstack/echo/v4"
	"github.com/vcokltfre/packlog/src/backend/data"
)

func deleteInvite(c echo.Context) error {
	code := c.Param("code")

	username := c.Get("username").(string)
	db := c.Get("db").(*data.DB)

	user, err := db.GetUserByUsername(c.Request().Context(), username)
	if err != nil {
		return c.JSON(500, map[string]string{"error": "Failed to retrieve user"})
	}

	if !user.Admin {
		return c.JSON(403, map[string]string{"error": "Only admins can delete invites"})
	}

	if err := db.DeleteInvite(c.Request().Context(), code); err != nil {
		return c.JSON(500, map[string]string{"error": "Failed to delete invite"})
	}

	return c.NoContent(204)
}
