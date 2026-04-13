CREATE TABLE Users (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    admin    BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE Invites (
    code     TEXT PRIMARY KEY,
    username TEXT NOT NULL
);

CREATE TABLE TicketLog (
    date TIMESTAMPTZ NOT NULL,
    username TEXT NOT NULL REFERENCES Users(username) ON DELETE CASCADE,
    tandem_count INT NOT NULL,
    instructor_count INT NOT NULL,
    blue_ticket_count INT NOT NULL,
    pink_ticket_count INT NOT NULL,
    kit_hire_count INT NOT NULL,
    PRIMARY KEY (date, username)
);
