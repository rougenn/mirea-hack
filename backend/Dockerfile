# Используем официальный образ Go
FROM golang:1.23-alpine

# Устанавливаем рабочую директорию в контейнере
WORKDIR /app

# Устанавливаем bash
RUN apk add --no-cache bash

# Копируем go.mod и go.sum для установки зависимостей
COPY go.mod go.sum ./

# Устанавливаем зависимости
RUN go mod tidy

# Копируем остальные файлы проекта
COPY . .

# Копируем скрипт ожидания
COPY wait-for-it.sh /app/wait-for-it.sh

# Делаем скрипт исполняемым
RUN chmod +x /app/wait-for-it.sh

# Собираем бинарник и помещаем его в /app
RUN go build -o main ./cmd/app

# Устанавливаем команду запуска с ожиданием PostgreSQL
CMD ["./wait-for-it.sh", "postgres:5432", "--", "./main"]
