package v1

import (
	"mirea-hack/internal/usecase"
	"mirea-hack/pkg/jwt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func NewRouter(handler *gin.Engine, uc usecase.User, ac usecase.FormulaApi) {
	// Options
	handler.Use(gin.Logger())
	handler.Use(gin.Recovery())

	// K8s probe
	handler.GET("/healthz", func(c *gin.Context) { c.Status(http.StatusOK) })

	r := New(uc, ac)
	handler.POST("/api/user/login", r.LogIn)
	handler.POST("/api/user/signup", r.Register)
	handler.POST("/api/user/refresh-token", RefreshToken)

	// Prometheus metrics
	handler.GET("/metrics", gin.WrapH(promhttp.Handler()))

	handler.POST("/api/refresh-token", RefreshToken)

	// Routers
	protected := handler.Group("/api")
	protected.Use(jwt.AuthMiddleware())

	protected.GET("/formula-db/list", r.GetFormulaDBList) // получаем список всех дб юзера

	protected.POST("/compare/with-db")      // сравнение с какой то дб юзера
	protected.POST("/compare/with-formula") // сравнение с формулой

	protected.PUT("/formula-db/new", r.CreateFormulaDB) // создаем новую дб для юзера
	protected.GET("/formula-db")                        // получаем какую-то дб (думаю можно обойтись без нее)

}
