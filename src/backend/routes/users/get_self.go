package users

import (
	"github.com/labstack/echo/v4"
	"github.com/vcokltfre/packlog/src/backend/data"
)

func getSelf(c echo.Context) error {
	username := c.Get("username").(string)
	db := c.Get("db").(*data.DB)

	user, err := db.GetUserByUsername(c.Request().Context(), username)
	if err != nil {
		return c.JSON(500, map[string]string{"error": "Failed to retrieve user"})
	}

	return c.JSON(200, map[string]interface{}{
		"username": user.Username,
		"admin":    user.Admin,
	})
}
