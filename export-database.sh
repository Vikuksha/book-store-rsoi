#!/bin/bash

# Скрипт для экспорта базы данных BookStore
# Создает дамп всех данных для переноса на другую машину

echo "📦 Экспорт базы данных BookStore..."

# Параметры подключения к БД
# На macOS с Homebrew используется текущий пользователь, а не postgres
DB_NAME=${DB_NAME:-bookstore}
DB_USER=${DB_USER:-$(whoami)}
DB_HOST=${DB_HOST:-}
DB_PORT=${DB_PORT:-5432}
DB_PASSWORD=${DB_PASSWORD:-}

# Если указан пароль, экспортируем его для pg_dump
if [ -n "$DB_PASSWORD" ]; then
    export PGPASSWORD="$DB_PASSWORD"
    echo "🔐 Используется пароль из переменной окружения DB_PASSWORD"
fi

# Определяем параметры подключения
# Если DB_HOST пустой или localhost, используем Unix socket (без -h) для peer authentication
# Иначе используем TCP/IP подключение
if [ -z "$DB_HOST" ] || [ "$DB_HOST" = "localhost" ]; then
    PGDUMP_HOST_ARGS=""
    PGDUMP_PORT_ARGS=""
    PSQL_HOST_ARGS=""
    PSQL_PORT_ARGS=""
    echo "🔌 Используется Unix socket (peer authentication, без пароля)"
else
    PGDUMP_HOST_ARGS="-h ${DB_HOST}"
    PGDUMP_PORT_ARGS="-p ${DB_PORT}"
    PSQL_HOST_ARGS="-h ${DB_HOST}"
    PSQL_PORT_ARGS="-p ${DB_PORT}"
    echo "🔌 Используется TCP/IP подключение к ${DB_HOST}:${DB_PORT}"
fi

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
echo "👤 Используется пользователь БД: ${DB_USER}"

# Проверяем существование пользователя PostgreSQL
echo "🔍 Проверка пользователя PostgreSQL..."
# Сначала пытаемся подключиться как текущий пользователь для проверки
if psql ${PSQL_HOST_ARGS} ${PSQL_PORT_ARGS} -d postgres -c "\du" 2>/dev/null | grep -qw "${DB_USER}"; then
    echo "✅ Пользователь '${DB_USER}' существует в PostgreSQL"
else
    # Если не получилось, пробуем найти существующего суперпользователя
    # Сначала пробуем подключиться без указания пользователя (peer auth)
    EXISTING_SUPERUSER=$(psql ${PSQL_HOST_ARGS} ${PSQL_PORT_ARGS} -d postgres -t -c "SELECT rolname FROM pg_roles WHERE rolsuper = true LIMIT 1;" 2>/dev/null | xargs)
    
    if [ -z "$EXISTING_SUPERUSER" ]; then
        # Если не удалось подключиться, пробуем создать пользователя напрямую
        echo "⚠️  Пользователь '${DB_USER}' не найден в PostgreSQL"
        echo "📝 Попытка создать пользователя '${DB_USER}'..."
        if createuser -s "${DB_USER}" 2>/dev/null; then
            echo "✅ Пользователь '${DB_USER}' создан успешно"
        else
            echo "❌ Не удалось создать пользователя автоматически"
            echo "💡 Создайте пользователя вручную от имени существующего суперпользователя:"
            echo "   # Сначала найдите существующего пользователя:"
            echo "   psql -d postgres -c \"\\du\""
            echo "   # Затем создайте нового пользователя:"
            echo "   createuser -s ${DB_USER}"
            echo "   # или от имени существующего:"
            echo "   createuser -U existing_user -s ${DB_USER}"
            exit 1
        fi
    else
        # Проверяем через существующего суперпользователя
        if psql ${PSQL_HOST_ARGS} ${PSQL_PORT_ARGS} -U "${EXISTING_SUPERUSER}" -d postgres -c "\du" 2>/dev/null | grep -qw "${DB_USER}"; then
            echo "✅ Пользователь '${DB_USER}' существует в PostgreSQL"
        else
            echo "⚠️  Пользователь '${DB_USER}' не найден в PostgreSQL"
            echo "📝 Создание пользователя '${DB_USER}' от имени '${EXISTING_SUPERUSER}'..."
            if createuser -U "${EXISTING_SUPERUSER}" -s "${DB_USER}" 2>/dev/null; then
                echo "✅ Пользователь '${DB_USER}' создан успешно"
            else
                echo "❌ Не удалось создать пользователя автоматически"
                echo "💡 Создайте пользователя вручную:"
                echo "   createuser -U ${EXISTING_SUPERUSER} -s ${DB_USER}"
                echo ""
                echo "💡 Или используйте существующего пользователя:"
                echo "   DB_USER=${EXISTING_SUPERUSER} ./export-database.sh"
                exit 1
            fi
        fi
    fi
fi

# Создаем директорию database если её нет
mkdir -p database

# Экспортируем базу данных
echo "📊 Экспорт базы данных '${DB_NAME}'..."
if pg_dump ${PGDUMP_HOST_ARGS} ${PGDUMP_PORT_ARGS} -U "${DB_USER}" -d "${DB_NAME}" \
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

