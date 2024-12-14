package server

import (
	"context"
	"mirea-hack/pkg/logger"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

const (
	_defaultReadTimeout     = 5 * time.Second
	_defaultWriteTimeout    = 5 * time.Second
	_defaultAddr            = ":8090"
	_defaultShutdownTimeout = 3 * time.Second
)

type Server struct {
	server          *http.Server
	shutdownTimeout time.Duration
	logger          logger.Logger
}

func New(handler *gin.Engine, opts ...Option) *Server {
	httpServer := &http.Server{
		Handler:      handler,
		ReadTimeout:  _defaultReadTimeout,
		WriteTimeout: _defaultWriteTimeout,
		Addr:         _defaultAddr,
	}

	logger, _ := logger.New()

	s := &Server{
		server:          httpServer,
		shutdownTimeout: _defaultShutdownTimeout,
		logger:          *logger,
	}

	// Custom options
	for _, opt := range opts {
		opt(s)
	}

	s.start()

	return s
}

func (s *Server) start() {
	go func() {
		s.server.ListenAndServe()
	}()
}

// Shutdown -.
func (s *Server) Shutdown() error {
	ctx, cancel := context.WithTimeout(context.Background(), s.shutdownTimeout)
	defer cancel()

	return s.server.Shutdown(ctx)
}
