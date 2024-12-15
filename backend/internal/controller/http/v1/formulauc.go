package v1

import (
	"mirea-hack/internal/entity"
	"mirea-hack/pkg/jwt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func (r *Uc) GetFormulaDBList(ctx *gin.Context) {
	userID := jwt.GetUserIDFromContext(ctx)
	if userID == uuid.Nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	list, err := r.uc.GetUserDBS(userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"dbs": list})
}

func (r *Uc) CreateFormulaDB(ctx *gin.Context) {
	userID := jwt.GetUserIDFromContext(ctx)

	if userID == uuid.Nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var input struct {
		Name  string            `json:"name" binding:"required"`
		Table []*entity.Formula `json:"table"`
	}

	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input data", "details": err.Error()})
		return
	}

	newFormulaDb := entity.FormulaDb{
		Name:  input.Name,
		Table: input.Table,
		ID:    uuid.New(),
	}

	dbID, err := r.uc.CreateNewFormulaDB(newFormulaDb, userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create FormulaDB", "details": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"id": dbID})
}

func (r *Uc) CompareWithFormula(ctx *gin.Context) {
	userID := jwt.GetUserIDFromContext(ctx)

	if userID == uuid.Nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var input struct {
		Formula1 string `json:"formula1" binding:"required"`
		Formula2 string `json:"formula2" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input data", "details": err.Error()})
		return
	}

	score, formula1, formula2, err := r.ac.Compare(input.Formula1, input.Formula2)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"score":    score,
		"formula1": formula1,
		"formula2": formula2,
	})
}

func (r *Uc) CompareWithDB(ctx *gin.Context) {
	userID := jwt.GetUserIDFromContext(ctx)

	if userID == uuid.Nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var input struct {
		Formula   string   `json:"formula" binding:"required"`
		FormulaDB []string `json:"formuladb" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input data", "details": err.Error()})
		return
	}

	response, err := r.ac.CompareWithDB(input.Formula, input.FormulaDB)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "server error", "details": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"top5": response.Top5,
	})
}
