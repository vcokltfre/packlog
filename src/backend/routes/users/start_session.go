package users

import (
	"github.com/labstack/echo/v4"
	"github.com/vcokltfre/packlog/src/backend/auth"
)

type startSessionRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func startSession(c echo.Context) error {
	req := &startSessionRequest{}
	if err := c.Bind(req); err != nil {
		return c.JSON(400, map[string]string{"error": "Invalid request body"})
	}

	am := c.Get("auth").(*auth.AuthManager)
	sessionToken, err := am.Authenticate(c.Request().Context(), req.Username, req.Password)
	if err != nil {
		return c.JSON(401, map[string]string{"error": "Invalid username or password"})
	}

	return c.JSON(200, map[string]string{"token": sessionToken})
}
