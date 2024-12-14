package entity

type Formula struct {
	Name  string `json:"name" binding:"required"`
	Value string `json:"value" binding:"required"`
}
