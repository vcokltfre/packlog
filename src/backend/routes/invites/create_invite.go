package invites

import (
	"crypto/rand"
	"fmt"

	"github.com/labstack/echo/v4"
	"github.com/vcokltfre/packlog/src/backend/data"
	"github.com/vcokltfre/packlog/src/backend/data/database"
)

func createInvite(c echo.Context) error {
	usernameToCreate := c.QueryParam("username")
	if usernameToCreate == "" {
		return c.JSON(400, map[string]string{"error": "Username query parameter is required"})
	}

	username := c.Get("username").(string)
	db := c.Get("db").(*data.DB)

	user, err := db.GetUserByUsername(c.Request().Context(), username)
	if err != nil {
		return c.JSON(500, map[string]string{"error": "Failed to retrieve user"})
	}

	if !user.Admin {
		return c.JSON(403, map[string]string{"error": "Only admins can create invites"})
	}

	codeBytes := make([]byte, 6)
	if _, err := rand.Read(codeBytes); err != nil {
		return c.JSON(500, map[string]string{"error": "Failed to generate invite code"})
	}
	code := fmt.Sprintf("%x", codeBytes)

	if err := db.CreateInvite(c.Request().Context(), database.CreateInviteParams{
		Username: usernameToCreate,
		Code:     code,
	}); err != nil {
		return c.JSON(500, map[string]string{"error": "Failed to create invite"})
	}

	return c.JSON(200, map[string]string{"code": code})
}
