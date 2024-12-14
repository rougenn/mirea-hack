package v1

import (
	"errors"
	"mirea-hack/internal/entity"
	"mirea-hack/internal/usecase"
	"mirea-hack/pkg/jwt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type Uc struct {
	uc usecase.User
	ac usecase.FormulaApi
}

func New(uc usecase.User, ac usecase.FormulaApi) Uc {
	return Uc{
		uc: uc,
		ac: ac,
	}
}

func (r *Uc) Register(ctx *gin.Context) {
	var req entity.User
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := r.uc.Register(req)
	if err != nil {
		if errors.Is(err, ErrAlreadyExists) {
			ctx.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{"user": user})
}

func (r *Uc) LogIn(ctx *gin.Context) {
	var req entity.User
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := r.uc.SignIn(req.Email, req.Password)
	if err != nil {
		if errors.Is(err, usecase.ErrIncorrectData) {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	accessToken, err := jwt.GenerateAccessToken(user.ID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate access token"})
		return
	}

	refreshToken, err := jwt.GenerateRefreshToken(user.ID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate refresh token"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"user":          user,
		"access_token":  accessToken,
		"refresh_token": refreshToken,
	})
}
