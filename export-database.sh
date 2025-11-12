#!/bin/bash

# Скрипт для экспорта базы данных BookStore
# Создает дамп всех данных для переноса на другую машину

echo "📦 Экспорт базы данных BookStore..."

# Параметры подключения к БД
DB_NAME=${DB_NAME:-bookstore}
DB_USER=${DB_USER:-postgres}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

# Имя файла дампа с датой и временем
DUMP_FILE="database/dump_$(date +%Y%m%d_%H%M%S).sql"
DUMP_FILE_LATEST="database/dump_latest.sql"

# Проверяем наличие pg_dump
if ! command -v pg_dump &> /dev/null; then
    echo "❌ pg_dump не найден!"
    echo "📦 Установите PostgreSQL клиент:"
    echo "   macOS: brew install postgresql"
    echo "   Ubuntu: sudo apt install postgresql-client"
    exit 1
fi

echo "✅ pg_dump найден"

# Создаем директорию database если её нет
mkdir -p database

# Экспортируем базу данных
echo "📊 Экспорт базы данных '${DB_NAME}'..."
if pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
    --no-owner \
    --no-privileges \
    --clean \
    --if-exists \
    --format=plain \
    --file="${DUMP_FILE}"; then
    echo "✅ Дамп создан: ${DUMP_FILE}"
    
    # Создаем также ссылку на последний дамп
    cp "${DUMP_FILE}" "${DUMP_FILE_LATEST}"
    echo "✅ Создана ссылка на последний дамп: ${DUMP_FILE_LATEST}"
else
    echo "❌ Ошибка при создании дампа"
    exit 1
fi

# Показываем размер файла
FILE_SIZE=$(du -h "${DUMP_FILE}" | cut -f1)
echo ""
echo "📊 Информация о дампе:"
echo "   Файл: ${DUMP_FILE}"
echo "   Размер: ${FILE_SIZE}"
echo ""
echo "🚀 Для импорта на другой машине используйте:"
echo "   ./import-database.sh ${DUMP_FILE}"
echo "   или"
echo "   ./import-database.sh ${DUMP_FILE_LATEST}"

