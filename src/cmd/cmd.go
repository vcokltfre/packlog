package cmd

import (
	"context"
	"os"
	"os/exec"
	"path/filepath"

	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
	"github.com/urfave/cli/v2"
	"github.com/vcokltfre/packlog/src/backend"
	"github.com/vcokltfre/packlog/src/backend/auth"
	"github.com/vcokltfre/packlog/src/backend/data"
)

func runIn(dir string, command string, args ...string) error {
	dir, err := filepath.Abs(dir)
	if err != nil {
		return err
	}

	cmd := exec.Command(command, args...)
	cmd.Dir = dir
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}

func runInAction(dir string, command string, args ...string) func(c *cli.Context) error {
	return func(c *cli.Context) error {
		return runIn(dir, command, args...)
	}
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}

	if defaultValue == "!" {
		logrus.Fatalf("Environment variable %s is required but not set", key)
	}

	return defaultValue
}

var App = &cli.App{
	Name:  "packlog",
	Usage: "A log for pack jobs at Skydive Langar",
	Commands: []*cli.Command{
		{
			Name:  "dev",
			Usage: "Run development commands such as database migrations.",
			Subcommands: []*cli.Command{
				{
					Name:  "frontend",
					Usage: "Interact with running and building the frontend.",
					Subcommands: []*cli.Command{
						{
							Name:   "build",
							Usage:  "Build the frontend for production.",
							Action: runInAction("src/dashboard", "npm", "run", "build"),
						},
						{
							Name:   "watch",
							Usage:  "Watch the frontend source files and rebuild on changes.",
							Action: runInAction("src/dashboard", "npm", "run", "dev"),
						},
					},
				},
				{
					Name:  "tempdb",
					Usage: "Create a temporary PostgreSQL database for development.",
					Action: func(ctx *cli.Context) error {
						name := "packlog"
						if ctx.NArg() > 0 {
							name = ctx.Args().First()
						}

						return runIn(
							".",
							"docker", "run", "--rm",
							"-e", "POSTGRES_USER="+name,
							"-e", "POSTGRES_PASSWORD="+name,
							"-e", "POSTGRES_DB="+name,
							"-p", "5432:5432",
							"postgres:16",
						)
					},
				},
				{
					Name:  "migrate",
					Usage: "Create and apply database migrations.",
					Subcommands: []*cli.Command{
						{
							Name:  "create",
							Usage: "Create a new database migration with the given name.",
							Action: func(ctx *cli.Context) error {
								name := ctx.Args().First()
								if name == "" {
									return cli.Exit("Migration name is required", 1)
								}

								dbUrl := "postgres://migrations:migrations@localhost:5432/migrations?sslmode=disable"
								if ctx.NArg() > 1 {
									dbUrl = ctx.Args().Get(1)
								}

								return runIn(
									".",
									"atlas", "migrate", "diff",
									"--to", "file://src/backend/data/schema.sql",
									"--dir", "file://src/backend/data/migrations",
									"--dev-url", dbUrl,
								)
							},
						},
						{
							Name:  "apply",
							Usage: "Apply all pending database migrations.",
							Action: func(ctx *cli.Context) error {
								dbUrl := "postgres://packlog:packlog@localhost:5432/packlog?sslmode=disable"
								if ctx.NArg() > 0 {
									dbUrl = ctx.Args().First()
								}

								return runIn(
									".",
									"atlas", "migrate", "apply",
									"--dir", "file://src/backend/data/migrations",
									"--url", dbUrl,
								)
							},
						},
					},
				},
			},
		},
		{
			Name:  "run",
			Usage: "Run Packlog",
			Action: func(c *cli.Context) error {
				godotenv.Load()

				logrus.SetFormatter(&logrus.TextFormatter{
					FullTimestamp: true,
				})

				bindAddress := getEnv("BIND_ADDRESS", ":8080")
				adminUsername := getEnv("BOOTSTRAP_ADMIN_USERNAME", "")
				adminPassword := getEnv("BOOTSTRAP_ADMIN_PASSWORD", "")
				databaseUrl := getEnv("DATABASE_URL", "!")
				externalUrl := getEnv("EXTERNAL_URL", "http://localhost:8080")

				db, err := data.Connect(databaseUrl)
				if err != nil {
					logrus.Fatalf("Failed to connect to database: %v", err)
				}

				am := auth.NewAuthManager(db)

				if adminUsername != "" && adminPassword != "" {
					if err := am.CreateUser(context.Background(), adminUsername, adminPassword); err != nil {
						if !data.IsUniqueViolationError(err) {
							logrus.Fatalf("Failed to create admin user: %v", err)
						}
					}

					am.GrantAdmin(context.Background(), adminUsername)

					logrus.Infof("Created admin user: %s", adminUsername)
				}

				if err := backend.Start(bindAddress, externalUrl, db, am); err != nil {
					logrus.Fatalf("Failed to start backend: %v", err)
				}

				return nil
			},
		},
	},
}
