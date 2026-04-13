package invites

import (
	"github.com/labstack/echo/v4"
	"github.com/vcokltfre/packlog/src/backend/data"
)

type inviteResponse struct {
	Code     string `json:"code"`
	Username string `json:"username"`
}

func listInvites(c echo.Context) error {
	username := c.Get("username").(string)
	db := c.Get("db").(*data.DB)

	user, err := db.GetUserByUsername(c.Request().Context(), username)
	if err != nil {
		return c.JSON(500, map[string]string{"error": "Failed to retrieve user"})
	}

	if !user.Admin {
		return c.JSON(403, map[string]string{"error": "Only admins can list invites"})
	}

	invites, err := db.ListInvites(c.Request().Context())
	if err != nil {
		return c.JSON(500, map[string]string{"error": "Failed to list invites"})
	}

	responses := make([]inviteResponse, len(invites))
	for i, invite := range invites {
		responses[i] = inviteResponse{
			Code:     invite.Code,
			Username: invite.Username,
		}
	}

	return c.JSON(200, responses)
}
