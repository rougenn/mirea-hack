package app

import (
	"errors"
	"log"
	"os"
	"time"

	"github.com/golang-migrate/migrate/v4"
	// migrate tools
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

const (
	defaultAttempts = 20
	defaultTimeout  = time.Second
)

func migration() {
	databaseURL, ok := os.LookupEnv("PG_URL")
	if !ok || len(databaseURL) == 0 {
		log.Fatalf("Migrate: переменная окружения не указана: PG_URL")
	}

	databaseURL += "?sslmode=disable"

	var (
		attempts = defaultAttempts
		err      error
		m        *migrate.Migrate
	)

	// Подключение с несколькими попытками
	for attempts > 0 {
		m, err = migrate.New("file://migrations", databaseURL)
		if err == nil {
			break
		}

		log.Printf("Migrate: попытка подключения к Postgres, осталось попыток: %d", attempts)
		time.Sleep(defaultTimeout)
		attempts--
	}

	if err != nil {
		log.Fatalf("Migrate: ошибка подключения к Postgres: %s", err)
	}

	// Выполнение миграций
	err = m.Up()
	defer func() {
		if closeErr, _ := m.Close(); closeErr != nil {
			log.Printf("Migrate: ошибка закрытия мигратора: %s", closeErr)
		}
	}()

	if err != nil {
		if errors.Is(err, migrate.ErrNoChange) {
			log.Printf("Migrate: нет изменений")
			return
		}
		log.Fatalf("Migrate: ошибка выполнения миграций: %s", err)
	}

	log.Printf("Migrate: миграции выполнены успешно")
}
