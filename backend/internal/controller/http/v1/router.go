package v1

import (
	"mirea-hack/internal/usecase"
	"mirea-hack/pkg/jwt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func NewRouter(handler *gin.Engine, uc usecase.User, ac usecase.FormulaApi) {
	// Middleware
	handler.Use(gin.Logger())
	handler.Use(gin.Recovery())

	// K8s probe
	handler.GET("/healthz", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	r := New(uc, ac)

	handler.POST("/api/user/login", r.LogIn)
	handler.POST("/api/user/signup", r.Register)
	handler.POST("/api/user/refresh-token", RefreshToken)
	handler.POST("/api/refresh-token", RefreshToken)

	handler.GET("/metrics", gin.WrapH(promhttp.Handler()))

	protected := handler.Group("/api")
	{
		protected.Use(jwt.AuthMiddleware())
		protected.GET("/formula-db/list", r.GetFormulaDBList)
		protected.POST("/compare/with-db", r.CompareWithDB)
		protected.POST("/compare/with-formula", r.CompareWithFormula)
		protected.PUT("/formula-db/new", r.CreateFormulaDB)
		protected.GET("/formula-db")
	}

	handler.Static("/assets", "./frontend/dist/assets")
	handler.GET("/", func(c *gin.Context) {
		c.File("./frontend/dist/index.html")
	})
	handler.NoRoute(func(c *gin.Context) {
		c.File("./frontend/dist/index.html")
	})

}
