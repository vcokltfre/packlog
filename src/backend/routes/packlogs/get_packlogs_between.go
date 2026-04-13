package packlogs

import (
	"time"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/labstack/echo/v4"
	"github.com/vcokltfre/packlog/src/backend/data"
	"github.com/vcokltfre/packlog/src/backend/data/database"
)

func getPacklogsBetween(c echo.Context) error {
	from, err := data.ParsePacklogDate(c.Param("from"))
	if err != nil {
		from = data.PacklogDate(time.Now())
	}

	to, err := data.ParsePacklogDate(c.Param("to"))
	if err != nil {
		to = data.PacklogDate(time.Now())
	}

	username := c.Get("username").(string)
	db := c.Get("db").(*data.DB)

	packlogs, err := db.GetTicketlogsBetweenDates(c.Request().Context(), database.GetTicketlogsBetweenDatesParams{
		Date: pgtype.Timestamptz{
			Time:  from,
			Valid: true,
		},
		Date_2: pgtype.Timestamptz{
			Time:  to,
			Valid: true,
		},
		Username: username,
	})
	if err != nil {
		return c.JSON(500, map[string]string{"error": "Failed to retrieve packlogs"})
	}

	response := make([]packlogResponse, len(packlogs))
	for i, pl := range packlogs {
		response[i] = packlogResponse{
			Date:       pl.Date.Time.Format("2006-01-02"),
			Tandems:    int(pl.TandemCount),
			Instructor: int(pl.InstructorCount),
			BlueTicket: int(pl.BlueTicketCount),
			PinkTicket: int(pl.PinkTicketCount),
			KitHire:    int(pl.KitHireCount),
		}
	}

	return c.JSON(200, response)
}
