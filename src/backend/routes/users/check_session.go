package users

import "github.com/labstack/echo/v4"

func checkSession(c echo.Context) error {
	return c.NoContent(200)
}
