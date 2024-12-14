package app

import (
	"log"
	"mirea-hack/config"
	v1 "mirea-hack/internal/controller/http/v1"
	"mirea-hack/internal/usecase"
	"mirea-hack/internal/usecase/db"
	"mirea-hack/pkg/logger"
	"mirea-hack/pkg/server"
	"os"
	"os/signal"
	"syscall"

	"github.com/gin-gonic/gin"
)

func Run(cfg *config.Config) {
	l, _ := logger.New()
	handler := gin.New()

	// DO NOT FORGET TO CHANGE IT -> IMPORT FROM ENVIRONMENT
	conn, ok := os.LookupEnv("CONN")
	if !ok || len(conn) == 0 {
		log.Fatalf("Migrate: переменная окружения не указана: CONN")
	}

	/*
		requires PG_URL from environment ne zabivaem when build docker budu!!!!!!!!!!!!!!!!!!!!!
		also do not forget about import keygen token for jwt
	*/

	databaseURL, ok := os.LookupEnv("PG_URL")
	if !ok || len(databaseURL) == 0 {
		log.Fatalf("Migrate: переменная окружения не указана: PG_URL")
	}

	databaseURL += "?sslmode=disable"
	databaseURL = "postgres://user:password@postgres:5432/my-database?sslmode=disable"

	database := db.New(databaseURL)
	userUC := usecase.NewUserUseCase(database)
	apiUC := usecase.NewFormulaApiUseCase(conn)

	v1.NewRouter(handler, userUC, apiUC)
	httpServer := server.New(handler, server.Port(cfg.HTTP.Port))

	// Waiting signal
	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt, syscall.SIGTERM)

	select {
	case s := <-interrupt:
		l.Log.Info("app - Run - signal: " + s.String())
	}

	// Shutdown
	err := httpServer.Shutdown()
	if err != nil {
		l.Log.Info(err.Error())
	}

}
