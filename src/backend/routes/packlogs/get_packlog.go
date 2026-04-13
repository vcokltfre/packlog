package packlogs

import (
	"time"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/labstack/echo/v4"
	"github.com/vcokltfre/packlog/src/backend/data"
	"github.com/vcokltfre/packlog/src/backend/data/database"
)

func getPacklog(c echo.Context) error {
	date, err := data.ParsePacklogDate(c.Param("date"))
	if err != nil {
		date = data.PacklogDate(time.Now())
	}

	username := c.Get("username").(string)
	db := c.Get("db").(*data.DB)

	packlog, err := db.GetTicketlogByDate(c.Request().Context(), database.GetTicketlogByDateParams{
		Date: pgtype.Timestamptz{
			Time:  date,
			Valid: true,
		},
		Username: username,
	})
	if err != nil {
		if data.IsNotFoundError(err) {
			return c.JSON(200, packlogResponse{
				Date:       date.Format("2006-01-02"),
				Tandems:    0,
				Instructor: 0,
				BlueTicket: 0,
				PinkTicket: 0,
				KitHire:    0,
			})
		}

		return c.JSON(500, map[string]string{"error": "Failed to retrieve packlog"})
	}

	return c.JSON(200, packlogResponse{
		Date:       packlog.Date.Time.Format("2006-01-02"),
		Tandems:    int(packlog.TandemCount),
		Instructor: int(packlog.InstructorCount),
		BlueTicket: int(packlog.BlueTicketCount),
		PinkTicket: int(packlog.PinkTicketCount),
		KitHire:    int(packlog.KitHireCount),
	})
}
