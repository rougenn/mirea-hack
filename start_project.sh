#!/bin/bash

# Название сети
NETWORK_NAME="app-network"

# Переменные для директорий
BACKEND_DIR="backend"
PYTHON_DIR="python"

# Проверка и создание сети
create_network_if_not_exists() {
    if ! docker network ls | grep -q "$NETWORK_NAME"; then
        echo "Сеть $NETWORK_NAME не найдена. Создаю сеть..."
        docker network create "$NETWORK_NAME" || { echo "Не удалось создать сеть $NETWORK_NAME"; exit 1; }
    else
        echo "Сеть $NETWORK_NAME уже существует."
    fi
}

# Функция для запуска Docker Compose
run_docker_compose() {
    local dir=$1
    echo "Переключение в директорию: $dir"
    cd "$dir" || { echo "Не удалось перейти в директорию $dir"; exit 1; }
    
    echo "Запуск Docker Compose в $dir..."
    docker-compose up --build || { echo "Ошибка при запуске Docker Compose в $dir"; exit 1; }

    echo "Возврат в исходную директорию"
    cd - > /dev/null || exit
}

# Проверка и создание сети
create_network_if_not_exists

# Запуск backend
run_docker_compose "$BACKEND_DIR"

# Запуск python
run_docker_compose "$PYTHON_DIR"

echo "Все сервисы запущены!"
