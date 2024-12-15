# Базовый образ Python
FROM python:3.12-slim

# Установим рабочую директорию в контейнере
WORKDIR /app

# Скопируем зависимости и установим их
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Скопируем остальные файлы
COPY . .

# Укажем точку входа (адаптер запускается как основной файл)
CMD ["python", "adapter.py"]
