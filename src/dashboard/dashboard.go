package dashboard

import (
	"embed"
	"strings"

	"github.com/labstack/echo/v4"
)

//go:embed dist
var dist embed.FS

func detectMimeType(filePath string) string {
	if strings.HasSuffix(filePath, ".html") {
		return "text/html; charset=utf-8"
	} else if strings.HasSuffix(filePath, ".css") {
		return "text/css; charset=utf-8"
	} else if strings.HasSuffix(filePath, ".js") {
		return "application/javascript; charset=utf-8"
	} else if strings.HasSuffix(filePath, ".json") {
		return "application/json; charset=utf-8"
	} else if strings.HasSuffix(filePath, ".png") {
		return "image/png"
	} else if strings.HasSuffix(filePath, ".jpg") || strings.HasSuffix(filePath, ".jpeg") {
		return "image/jpeg"
	} else if strings.HasSuffix(filePath, ".svg") {
		return "image/svg+xml"
	} else if strings.HasSuffix(filePath, ".woff") {
		return "font/woff"
	} else if strings.HasSuffix(filePath, ".woff2") {
		return "font/woff2"
	}
	return "application/octet-stream"
}

func Serve(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		path := c.Request().URL.Path
		if strings.HasPrefix(path, "/api/") {
			return next(c)
		}

		filePath := "dist" + path
		if path == "/" {
			filePath = "dist/index.html"
		}

		data, err := dist.ReadFile(filePath)
		if err != nil {
			data, err = dist.ReadFile("dist/index.html")
			if err != nil {
				return echo.ErrNotFound
			}
		}

		return c.Blob(200, detectMimeType(filePath), data)
	}
}
