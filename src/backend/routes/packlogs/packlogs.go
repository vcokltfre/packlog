package packlogs

import (
	"github.com/labstack/echo/v4"
	"github.com/vcokltfre/packlog/src/backend/auth"
)

type packlogResponse struct {
	Date       string `json:"date"`
	Tandems    int    `json:"tandems"`
	Instructor int    `json:"instructor"`
	BlueTicket int    `json:"blue_ticket"`
	PinkTicket int    `json:"pink_ticket"`
	KitHire    int    `json:"kit_hire"`
}

func Register(e *echo.Echo) {
	e.GET("/api/packlogs/:date", getPacklog, auth.AuthenticatedRoute)
	e.GET("/api/packlogs/between/:from/:to", getPacklogsBetween, auth.AuthenticatedRoute)
	e.PUT("/api/packlogs/:date", setPacklog, auth.AuthenticatedRoute)
}
