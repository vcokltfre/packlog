package auth

import "github.com/labstack/echo/v4"

func AuthenticatedRoute(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		am, ok := c.Get("auth").(*AuthManager)
		if !ok {
			return echo.NewHTTPError(500, "Auth manager not found in context")
		}

		session := c.Request().Header.Get("Authorization")
		if session == "" {
			return echo.NewHTTPError(401, "Missing Authorization header")
		}

		username, err := am.GetUsernameBySession(session)
		if err != nil {
			return echo.NewHTTPError(401, "Invalid session")
		}

		c.Set("username", username)

		return next(c)
	}
}
