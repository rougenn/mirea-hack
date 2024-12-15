package usecase

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

type FormulaApiUseCase struct {
	conn string
}

func NewFormulaApiUseCase(conn string) FormulaApiUseCase {
	return FormulaApiUseCase{
		conn: conn,
	}
}

func (uc FormulaApiUseCase) Compare(formula1, formula2 string) (float64, string, string, error) {
	requestData := struct {
		Formula1 string `json:"formula1"`
		Formula2 string `json:"formula2"`
	}{
		Formula1: formula1,
		Formula2: formula2,
	}

	jsonData, err := json.Marshal(requestData)
	if err != nil {
		return 0, "", "", fmt.Errorf("failed to marshal request data: %w", err)
	}
	resp, err := http.Post(uc.conn, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return 0, "", "", fmt.Errorf("failed to send request to Python server: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return 0, "", "", fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	var responseData struct {
		Score    float64 `json:"score"`
		Formula1 string  `json:"formula1"`
		Formula2 string  `json:"formula2"`
	}

	err = json.NewDecoder(resp.Body).Decode(&responseData)
	if err != nil {
		return 0, "", "", fmt.Errorf("failed to decode response from Python server: %w", err)
	}

	return responseData.Score, responseData.Formula1, responseData.Formula2, nil
}
