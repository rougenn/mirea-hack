package db

import (
	"database/sql"
	"fmt"
	"log"
	"mirea-hack/internal/entity"
	"time"

	"github.com/google/uuid"
	_ "github.com/lib/pq"
)

type Database struct {
	pg *sql.DB
}

func New(databaseURL string) Database {
	db, err := sql.Open("postgres", databaseURL)

	if err != nil {
		log.Fatal("connection: ", err)
		return Database{}
	}

	if err := db.Ping(); err != nil {
		log.Fatal("ping: ", err)
		return Database{}
	}

	return Database{
		pg: db,
	}
}

func (db Database) AddUser(user entity.User) (uuid.UUID, int64, error) {
	if user.ID == uuid.Nil {
		user.ID = uuid.New()
	}
	createdAt := time.Now().Unix()

	query := `
        INSERT INTO users (id, email, password_hash, created_at)
        VALUES ($1, $2, $3, $4)
        RETURNING id;
    `

	var id uuid.UUID
	err := db.pg.QueryRow(query, user.ID, user.Email, user.Password, createdAt).Scan(&id)
	if err != nil {
		return id, 0, fmt.Errorf("could not add user: %w", err)
	}

	return id, createdAt, nil
}

func (db Database) GetUserByEmail(email string) (entity.User, error) {
	query := `
        SELECT id, email, password_hash, created_at
        FROM users
        WHERE email = $1;
    `

	var user entity.User

	err := db.pg.QueryRow(query, email).Scan(
		&user.ID,
		&user.Email,
		&user.Password,
		&user.CreatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return user, fmt.Errorf("user with email %s not found", email)
		}
		return user, fmt.Errorf("could not get user: %w", err)
	}

	// Дополнительная проверка: если пользователь не найден,
	// но по какой-то причине Scan не вернул ErrNoRows.
	if user.ID == uuid.Nil {
		return user, fmt.Errorf("user with email %s not found", email)
	}

	return user, nil
}

func (db Database) AddFormulaDB(formulaDb entity.FormulaDb, userId uuid.UUID) error {
	query := `
		INSERT INTO formula_dbs (id, user_id, name)
		VALUES ($1, $2, $3)
		RETURNING id;
	`

	formulaDbID := uuid.New()

	var id uuid.UUID
	err := db.pg.QueryRow(query, formulaDbID, userId, formulaDb.Name).Scan(&id)
	if err != nil {
		return fmt.Errorf("could not add formula database: %w", err)
	}

	for _, formula := range formulaDb.Table {
		err := db.AddFormula(*formula, formulaDbID)
		if err != nil {
			return fmt.Errorf("could not add formula: %w", err)
		}
	}

	return nil
}

func (db Database) AddFormula(formula entity.Formula, formulaDbID uuid.UUID) error {
	query := `
		INSERT INTO formulas (id, formula_db_id, name, value)
		VALUES ($1, $2, $3, $4)
		RETURNING id;
	`

	formulaID := uuid.New()

	var id uuid.UUID
	err := db.pg.QueryRow(query, formulaID, formulaDbID, formula.Name, formula.Value).Scan(&id)
	if err != nil {
		return fmt.Errorf("could not add formula: %w", err)
	}

	return nil
}

func (db Database) GetFormula(formulaUuid uuid.UUID) (entity.Formula, error) {
	query := `
		SELECT name, value
		FROM formulas
		WHERE id = $1;
	`

	var formula entity.Formula
	err := db.pg.QueryRow(query, formulaUuid).Scan(&formula.Name, &formula.Value)
	if err != nil {
		if err == sql.ErrNoRows {
			return formula, fmt.Errorf("formula with id %v not found", formulaUuid)
		}
		return formula, fmt.Errorf("could not get formula: %w", err)
	}

	return formula, nil
}

func (db Database) GetFormulas(formulaDbID uuid.UUID) ([]*entity.Formula, error) {
	query := `
		SELECT id
		FROM formulas
		WHERE formula_db_id = $1;
	`

	rows, err := db.pg.Query(query, formulaDbID)
	if err != nil {
		return nil, fmt.Errorf("could not get formulas: %w", err)
	}
	defer rows.Close()

	var formulas []*entity.Formula

	for rows.Next() {
		var formulaID uuid.UUID
		err := rows.Scan(&formulaID)
		if err != nil {
			return nil, fmt.Errorf("could not scan formula ID: %w", err)
		}

		formula, err := db.GetFormula(formulaID)
		if err != nil {
			return nil, fmt.Errorf("could not get formula: %w", err)
		}

		formulas = append(formulas, &formula)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error occurred while reading formulas: %w", err)
	}

	return formulas, nil
}

func (db Database) GetFormulaDB(formulaDbID uuid.UUID) (entity.FormulaDb, error) {
	query := `
		SELECT name
		FROM formula_dbs
		WHERE id = $1;
	`

	var formulaDb entity.FormulaDb
	formulaDb.Table = []*entity.Formula{}

	err := db.pg.QueryRow(query, formulaDbID).Scan(&formulaDb.Name)
	if err != nil {
		if err == sql.ErrNoRows {
			return formulaDb, fmt.Errorf("formula DB with id %v not found", formulaDbID)
		}
		return formulaDb, fmt.Errorf("could not get formula DB: %w", err)
	}

	formulas, err := db.GetFormulas(formulaDbID)
	if err != nil {
		return formulaDb, fmt.Errorf("could not get formulas: %w", err)
	}

	formulaDb.Table = formulas

	return formulaDb, nil
}

func (db Database) GetUserDBS(userID uuid.UUID) ([]entity.FormulaDb, error) {
	query := `
        SELECT id, name
        FROM formula_dbs
        WHERE user_id = $1;
    `

	rows, err := db.pg.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("could not query user formula DBs: %w", err)
	}
	defer rows.Close()

	var dbs []entity.FormulaDb
	for rows.Next() {
		var fdb entity.FormulaDb
		if err := rows.Scan(&fdb.ID, &fdb.Name); err != nil {
			return nil, fmt.Errorf("could not scan formula_db: %w", err)
		}

		// Подгружаем формулы для каждого FormulaDb
		formulas, err := db.GetFormulas(fdb.ID)
		if err != nil {
			return nil, fmt.Errorf("could not get formulas for DB %v: %w", fdb.ID, err)
		}
		fdb.Table = formulas

		dbs = append(dbs, fdb)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error reading formula_db rows: %w", err)
	}

	return dbs, nil
}
