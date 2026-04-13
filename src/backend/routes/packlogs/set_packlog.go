package packlogs

import (
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/labstack/echo/v4"
	"github.com/vcokltfre/packlog/src/backend/data"
	"github.com/vcokltfre/packlog/src/backend/data/database"
)

func setPacklog(c echo.Context) error {
	date, err := data.ParsePacklogDate(c.Param("date"))
	if err != nil {
		return c.JSON(400, map[string]string{"error": "Invalid date format"})
	}

	var req struct {
		Tandems    int `json:"tandems"`
		Instructor int `json:"instructor"`
		BlueTicket int `json:"blue_ticket"`
		PinkTicket int `json:"pink_ticket"`
		KitHire    int `json:"kit_hire"`
	}

	if err := c.Bind(&req); err != nil {
		return c.JSON(400, map[string]string{"error": "Invalid request body"})
	}

	db := c.Get("db").(*data.DB)
	username := c.Get("username").(string)

	err = db.CreateOrUpdateTicketlog(c.Request().Context(), database.CreateOrUpdateTicketlogParams{
		Date: pgtype.Timestamptz{
			Time:  data.PacklogDate(date),
			Valid: true,
		},
		Username:        username,
		TandemCount:     int32(req.Tandems),
		InstructorCount: int32(req.Instructor),
		BlueTicketCount: int32(req.BlueTicket),
		PinkTicketCount: int32(req.PinkTicket),
		KitHireCount:    int32(req.KitHire),
	})
	if err != nil {
		return c.JSON(500, map[string]string{"error": "Failed to save packlog"})
	}

	return c.JSON(200, map[string]string{"status": "success"})
}
