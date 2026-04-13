-- name: CreateOrUpdateTicketlog :exec
INSERT INTO TicketLog (date, username, tandem_count, instructor_count, blue_ticket_count, pink_ticket_count, kit_hire_count)
VALUES ($1, $2, $3, $4, $5, $6, $7)
ON CONFLICT (date, username) DO UPDATE SET
    tandem_count = EXCLUDED.tandem_count,
    instructor_count = EXCLUDED.instructor_count,
    blue_ticket_count = EXCLUDED.blue_ticket_count,
    pink_ticket_count = EXCLUDED.pink_ticket_count,
    kit_hire_count = EXCLUDED.kit_hire_count;

-- name: GetTicketlogByDate :one
SELECT * FROM TicketLog WHERE date = $1 AND username = $2;

-- name: GetTicketlogsBetweenDates :many
SELECT * FROM TicketLog WHERE date >= $1 AND date <= $2 AND username = $3 ORDER BY date ASC;
