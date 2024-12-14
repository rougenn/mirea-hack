package usecase

import (
	"mirea-hack/internal/entity"

	"github.com/google/uuid"
)

type (
	User interface {
		SignIn(email, password string) (entity.User, error)
		Register(req entity.User) (entity.User, error)
		GetUserDBS(userID uuid.UUID) ([]entity.FormulaDb, error)
		CreateNewFormulaDB(f entity.FormulaDb, userID uuid.UUID) (uuid.UUID, error)
	}

	Database interface {
		AddUser(entity.User) (uuid.UUID, int64, error)
		AddFormulaDB(entity.FormulaDb, uuid.UUID) error
		AddFormula(entity.Formula, uuid.UUID) error
		GetFormulaDB(uuid.UUID) (entity.FormulaDb, error)
		GetUserByEmail(string) (entity.User, error)
		GetFormulas(uuid.UUID) ([]*entity.Formula, error)
		GetUserDBS(userID uuid.UUID) ([]entity.FormulaDb, error)
	}

	FormulaApi interface {
		Compare(entity.Formula, entity.Formula) (float64, string, string, error) // percent of несовпадения, two formulas >!
	}
)
