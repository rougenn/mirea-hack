package v1

import "errors"

var (
	ErrAlreadyExists = errors.New("user with this email or phone already exists")
	ErrNotFound      = errors.New("user not found")
)
