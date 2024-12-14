package jwt

import (
	"errors"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
)

var jwtSecret = []byte("kljasdf;j;lasjdfhjkjk")

func GenerateAccessToken(userID uuid.UUID) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID.String(),
		"exp":     time.Now().Add(3 * time.Minute).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func GenerateRefreshToken(userID uuid.UUID) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID.String(),
		"exp":     time.Now().Add(7 * 24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func ParseAccessToken(tokenString string) (uuid.UUID, error) {
	return parseToken(tokenString)
}

func ParseRefreshToken(tokenString string) (uuid.UUID, error) {
	return parseToken(tokenString)
}

func parseToken(tokenString string) (uuid.UUID, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return jwtSecret, nil
	})

	if err != nil || !token.Valid {
		return uuid.Nil, errors.New("invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return uuid.Nil, errors.New("invalid token claims")
	}

	exp, ok := claims["exp"].(float64)
	if ok && time.Unix(int64(exp), 0).Before(time.Now()) {
		return uuid.Nil, errors.New("token has expired")
	}

	userIDStr, ok := claims["user_id"].(string)
	if !ok {
		return uuid.Nil, errors.New("invalid user ID in token")
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return uuid.Nil, errors.New("invalid user ID format")
	}

	log.Printf("Parsed user_id from token: %s", userID.String())
	return userID, nil
}

func GetUserIDFromContext(ctx *gin.Context) uuid.UUID {
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		ctx.Abort()
		return uuid.Nil
	}
	return userID.(uuid.UUID)
}

func AuthMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		authHeader := ctx.GetHeader("Authorization")
		if authHeader == "" {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header missing"})
			ctx.Abort()
			return
		}

		log.Printf("Authorization Header: %s", authHeader)

		if len(authHeader) < 7 || authHeader[:7] != "Bearer " {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header format invalid"})
			ctx.Abort()
			return
		}

		tokenString := authHeader[7:]
		userID, err := ParseAccessToken(tokenString)
		if err != nil {
			log.Printf("Error parsing access token: %s", err.Error()) // Логируем ошибку
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token", "details": err.Error()})
			ctx.Abort()
			return
		}

		ctx.Set("user_id", userID)
		ctx.Next()
	}
}
