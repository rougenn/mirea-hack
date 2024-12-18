# FormulaI

**FormulaI** — это веб-приложение, реализующее функциональность для работы с формулами. Пользователи могут регистрироваться, создавать базы формул, сравнивать формулы между собой и с базами. Взаимодействие с формулами происходит через **Go-сервер**, а вычисления и сравнения выполняются с использованием **Python-скрипта**.

## Стек технологий

- **Backend**: Go (Gin, Clean Architecture)
- **Database**: PostgreSQL
- **Python**: Сравнение формул
- **Docker** и **Docker Compose**: для контейнеризации и оркестрации

## Основные возможности

- Регистрация и авторизация пользователей.
- Управление базами формул:
  - Создание и хранение формул.
  - Сравнение двух формул.
  - Сравнение формулы с базой формул.
- Взаимодействие с Python-скриптом для вычислений и анализа.
- REST API для обмена данными между клиентом и сервером.

---

## Структура проекта

```plaintext
.
├── backend                   # Бэкенд на Go
│   ├── cmd/app               # Точка входа
│   │   └── main.go           # Основная функция
│   ├── config
│   │   ├── config.go         # Структура и загрузка конфигурации
│   │   └── config.yml        # YAML-файл конфигурации
│   ├── internal
│   │   ├── app
│   │   │   ├── app.go        # Создание зависимостей и запуск сервера
│   │   │   └── migrate.go    # Автоматические миграции
│   │   ├── controller/http/v1
│   │   │   ├── auth.go       # Регистрация и авторизация
│   │   │   ├── formulaUC.go  # Обработчик для сравнения формул
│   │   │   ├── router.go     # Настройка роутов
│   │   │   └── token.go      # JWT токены
│   │   ├── entity
│   │   │   ├── formula.go    # Структура формулы
│   │   │   ├── formuladb.go  # Структура базы формул
│   │   │   └── user.go       # Структура пользователя
│   │   ├── usecase
│   │   │   ├── db            # Логика работы с базой данных
│   │   │   │   ├── databaseUseCase.go
│   │   │   │   └── formulaApi.go
│   │   │   ├── interfaces.go # Интерфейсы бизнес-логики
│   │   │   └── user.go       # Логика работы с пользователями
│   └── pkg
│       ├── jwt               # Логика JWT токенов
│       ├── logger            # Логирование
│       └── server            # Инициализация сервера
├── python                    # Python-сервер
│   ├── Dockerfile            # Сборка Python сервера
│   └── app.py                # Сравнение формул
└── docker-compose.yml        # Файл для запуска контейнеров
```

## Установка

### Шаг 1: Клонирование репозитория

Клонируйте проект на вашу машину:

```bash
git clone https://github.com/rougenn/mirea-hack.git
cd mirea-hack
```

### Шаг 2: Установка Docker и Docker Compose

#### Установите Docker
На официальном сайте Docker найдите инструкции для вашей операционной системы.
Следуйте инструкциям на официальной странице Docker Compose.

### Шаг 3: Запуск проекта
Перейдите в каталог проекта mirea-hack:
```bash
cd mirea-hack
```
### Шаг 4: Запустите контейнеры с помощью Docker Compose:
```bash
./start_project.sh
```
Скрипт start_project.sh автоматически создаст сеть и запустит все необходимые контейнеры для backend, python и postgres.
Если хотите запускать без скрипта, вы можете выполнить команду напрямую:
```bash
docker-compose up --build
```
### Шаг 5: Доступ к сервисам

Перейдите на страницу в браузере: http://localhost:8090/home

### Шаг 6: Остановка контейнеров

Чтобы остановить и удалить все контейнеры, используйте команду:
```bash
docker-compose down
```
### Шаг 7: (Опционально) Удаление сети

Если вы хотите удалить сеть app-network, выполните команду:
```bash
docker network rm app-network
```
Это нужно делать только в случае, если вы хотите удалить сеть вручную.
