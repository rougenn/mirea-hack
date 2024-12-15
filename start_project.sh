#!/bin/bash

# Название сети
NETWORK_NAME="app-network"

# Проверка и создание сети
create_network_if_not_exists() {
    if ! docker network ls | grep -q "$NETWORK_NAME"; then
        echo "Сеть $NETWORK_NAME не найдена. Создаю сеть..."
        docker network create "$NETWORK_NAME" || { echo "Не удалось создать сеть $NETWORK_NAME"; exit 1; }
    else
        echo "Сеть $NETWORK_NAME уже существует."
    fi
}

# Проверка и создание сети
create_network_if_not_exists

# Запуск Docker Compose
echo "Запуск Docker Compose..."
docker-compose up --build

echo "Все сервисы запущены!"
