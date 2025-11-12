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

# Сначала пытаемся найти существующего суперпользователя через peer auth (без указания пользователя)
# Это работает, если есть какой-то пользователь с доступом через peer authentication
EXISTING_SUPERUSER=""
if psql ${PSQL_HOST_ARGS} ${PSQL_PORT_ARGS} -d postgres -c "\du" >/dev/null 2>&1; then
    # Если удалось подключиться, получаем список суперпользователей
    EXISTING_SUPERUSER=$(psql ${PSQL_HOST_ARGS} ${PSQL_PORT_ARGS} -d postgres -t -c "SELECT rolname FROM pg_roles WHERE rolsuper = true LIMIT 1;" 2>/dev/null | xargs)
    echo "✅ Подключение к PostgreSQL успешно"
    
    # Проверяем, существует ли нужный пользователь
    if psql ${PSQL_HOST_ARGS} ${PSQL_PORT_ARGS} -d postgres -c "\du" 2>/dev/null | grep -qw "${DB_USER}"; then
        echo "✅ Пользователь '${DB_USER}' существует в PostgreSQL"
    else
        # Пытаемся создать пользователя
        if [ -n "$EXISTING_SUPERUSER" ]; then
            echo "⚠️  Пользователь '${DB_USER}' не найден в PostgreSQL"
            echo "📝 Создание пользователя '${DB_USER}' от имени '${EXISTING_SUPERUSER}'..."
            if createuser -U "${EXISTING_SUPERUSER}" -s "${DB_USER}" 2>/dev/null; then
                echo "✅ Пользователь '${DB_USER}' создан успешно"
            else
                echo "❌ Не удалось создать пользователя автоматически"
                echo ""
                echo "💡 РЕШЕНИЕ: Используйте существующего пользователя '${EXISTING_SUPERUSER}':"
                echo "   DB_USER=${EXISTING_SUPERUSER} ./export-database.sh"
                echo ""
                echo "💡 Или создайте пользователя вручную:"
                echo "   createuser -U ${EXISTING_SUPERUSER} -s ${DB_USER}"
                exit 1
            fi
        else
            echo "⚠️  Пользователь '${DB_USER}' не найден, но не удалось найти суперпользователя"
            echo "💡 Попробуйте использовать существующего пользователя:"
            echo "   psql -d postgres -c \"\\du\"  # чтобы увидеть список пользователей"
            echo "   DB_USER=имя_пользователя ./export-database.sh"
            exit 1
        fi
    fi
else
    # Не удалось подключиться к PostgreSQL
    echo "❌ Не удалось подключиться к PostgreSQL"
    echo ""
    echo "💡 Возможные решения:"
    echo "   1. Убедитесь, что PostgreSQL запущен:"
    echo "      brew services start postgresql"
    echo ""
    echo "   2. Проверьте существующих пользователей:"
    echo "      psql -d postgres -c \"\\du\""
    echo ""
    echo "   3. Используйте существующего пользователя:"
    echo "      DB_USER=имя_пользователя ./export-database.sh"
    echo ""
    echo "   4. Создайте пользователя от имени существующего суперпользователя:"
    echo "      createuser -U имя_суперпользователя -s ${DB_USER}"
    exit 1
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

