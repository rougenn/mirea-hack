package v1

import (
	"bytes"
	"encoding/json"
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

	requestData := map[string]interface{}{
		"formula":   input.Formula,
		"formuladb": input.FormulaDB,
	}

	jsonData, err := json.Marshal(requestData)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to serialize request data"})
		return
	}

	pythonServerURL := "http://python_server:5000/compare-with-db"
	resp, err := http.Post(pythonServerURL, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send request to Python server", "details": err.Error()})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Python server returned an error", "status": resp.StatusCode})
		return
	}

	var response struct {
		Top5 []struct {
			Formula string  `json:"formula"`
			Score   float64 `json:"score"`
		} `json:"top5"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode response from Python server"})
		return
	}

	// Возвращаем ответ клиенту
	ctx.JSON(http.StatusOK, gin.H{
		"top5": response.Top5,
	})
}
