#!/bin/bash

# Скрипт для импорта базы данных BookStore
# Восстанавливает данные из дампа на новой машине

# Проверяем аргумент (файл дампа)
if [ -z "$1" ]; then
    echo "📦 Импорт базы данных BookStore"
    echo ""
    echo "Использование: $0 <путь_к_файлу_дампа>"
    echo ""
    echo "Примеры:"
    echo "  $0 database/dump_latest.sql"
    echo "  $0 database/dump_20240101_120000.sql"
    echo ""
    echo "Доступные дампы:"
    if [ -d "database" ]; then
        ls -lh database/dump_*.sql 2>/dev/null || echo "  (дампы не найдены)"
    else
        echo "  (директория database не найдена)"
    fi
    exit 1
fi

DUMP_FILE="$1"

# Проверяем существование файла
if [ ! -f "$DUMP_FILE" ]; then
    echo "❌ Файл дампа не найден: ${DUMP_FILE}"
    exit 1
fi

# Параметры подключения к БД
DB_NAME=${DB_NAME:-bookstore}
DB_USER=${DB_USER:-postgres}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

echo "📦 Импорт базы данных BookStore..."
echo "📄 Файл дампа: ${DUMP_FILE}"

# Проверяем наличие psql
if ! command -v psql &> /dev/null; then
    echo "❌ psql не найден!"
    echo "📦 Установите PostgreSQL:"
    echo "   macOS: brew install postgresql"
    echo "   Ubuntu: sudo apt install postgresql postgresql-contrib"
    exit 1
fi

echo "✅ psql найден"

# Проверяем существование базы данных, если нет - создаем
echo "📊 Проверка базы данных '${DB_NAME}'..."
if psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -lqt | cut -d \| -f 1 | grep -qw "${DB_NAME}"; then
    echo "✅ База данных '${DB_NAME}' существует"
else
    echo "⚠️  База данных '${DB_NAME}' не существует, создаём..."
    if createdb -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" "${DB_NAME}"; then
        echo "✅ База данных '${DB_NAME}' создана"
    else
        echo "❌ Ошибка при создании базы данных"
        exit 1
    fi
fi

# Импортируем дамп
echo "📥 Импорт данных из дампа..."
if psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -f "${DUMP_FILE}"; then
    echo ""
    echo "✅ Данные успешно импортированы!"
    echo ""
    echo "📊 Проверка импортированных данных:"
    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c "
        SELECT 
            'Users' as table_name, COUNT(*) as count FROM \"Users\"
        UNION ALL
        SELECT 'Book', COUNT(*) FROM \"Book\"
        UNION ALL
        SELECT 'Order', COUNT(*) FROM \"Order\"
        UNION ALL
        SELECT 'Reviews', COUNT(*) FROM \"Reviews\"
        UNION ALL
        SELECT 'Order_composition', COUNT(*) FROM \"Order_composition\";
    "
    echo ""
    echo "🎉 Импорт завершен успешно!"
else
    echo "❌ Ошибка при импорте данных"
    exit 1
fi

