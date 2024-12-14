package usecase

import (
	"errors"
	"fmt"
	"mirea-hack/internal/entity"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// UserUseCase
type UserUseCase struct {
	store Database
}

func (uc UserUseCase) GetUserDBS(userID uuid.UUID) ([]entity.FormulaDb, error) {
	list, err := uc.store.GetUserDBS(userID)
	if err != nil {
		return nil, err
	}
	return list, nil
}

func NewUserUseCase(db Database) UserUseCase {
	uc := UserUseCase{
		store: db,
	}
	return uc
}

func (uc UserUseCase) SignIn(email, password string) (entity.User, error) {
	user, err := uc.store.GetUserByEmail(email)
	if err != nil {
		return entity.User{}, err
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return entity.User{}, err
	}

	return user, nil
}

func (uc UserUseCase) Register(req entity.User) (entity.User, error) {
	if _, err := uc.store.GetUserByEmail(req.Email); err == nil {
		// Пользователь найден, значит он уже существует
		return entity.User{}, errors.New("user already exists")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return entity.User{}, fmt.Errorf("failed to hash password: %w", err)
	}

	user := entity.User{
		Email:    req.Email,
		Password: string(hashedPassword),
	}

	id, createdAt, err := uc.store.AddUser(user)
	if err != nil {
		return entity.User{}, err
	}

	user.ID = id
	user.CreatedAt = createdAt
	return user, nil
}

func (uc UserUseCase) CreateNewFormulaDB(f entity.FormulaDb, userID uuid.UUID) (uuid.UUID, error) {
	if err := uc.store.AddFormulaDB(f, userID); err != nil {
		return uuid.Nil, err
	}
	return f.ID, nil
}
