package logger

import (
	"go.uber.org/zap"
)

type Logger struct {
	Log *zap.Logger
}

func New(opt ...zap.Option) (*Logger, error) {
	logger, err := zap.NewProduction(opt...)
	if err != nil {
		return nil, err
	}

	newLogger := Logger{
		Log: logger,
	}
	return &newLogger, nil
}
