package entity

import "github.com/google/uuid"

type FormulaDb struct {
	Table []*Formula `json:"table" binding:"required"`
	Name  string     `json:"name" binding:"required"`
	ID    uuid.UUID  `json:"id"`
}
