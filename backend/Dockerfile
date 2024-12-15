# Используем официальный образ Go в качестве базового
FROM golang:1.23-alpine

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Устанавливаем bash и dos2unix для конвертации окончаний строк
RUN apk add --no-cache bash dos2unix

# Копируем go.mod и go.sum для установки зависимостей
COPY go.mod go.sum ./

# Устанавливаем зависимости
RUN go mod tidy

# Копируем остальные файлы проекта
COPY . .

# Конвертируем окончания строк скрипта wait-for-it.sh на Unix-формат
RUN dos2unix wait-for-it.sh

# Проверяем и исправляем shebang в wait-for-it.sh (опционально)
# Убедитесь, что первая строка скрипта правильно указывает интерпретатор
RUN sed -i '1s|^.*$|#!/bin/bash|' wait-for-it.sh

# Делаем скрипт исполняемым
RUN chmod +x /app/wait-for-it.sh

# Проверяем наличие бинарного файла main (опционально для отладки)
# RUN ls -la /app

# Собираем бинарник и помещаем его в /app
RUN go build -o main ./cmd/app

# Устанавливаем команду запуска с ожиданием PostgreSQL
CMD ["./wait-for-it.sh", "postgres:5432", "--", "./main"]
