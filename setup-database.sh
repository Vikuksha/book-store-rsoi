#!/bin/bash

# Скрипт для установки и настройки PostgreSQL базы данных для BookStore
# Запустите этот скрипт для автоматической настройки

echo "🚀 Настройка PostgreSQL базы данных для BookStore..."

# Проверяем наличие PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL не установлен!"
    echo "📦 Установите PostgreSQL:"
    echo "   macOS: brew install postgresql"
    echo "   Ubuntu: sudo apt install postgresql postgresql-contrib"
    echo "   CentOS: sudo yum install postgresql postgresql-server"
    exit 1
fi

echo "✅ PostgreSQL найден"

# Проверяем наличие createdb
if ! command -v createdb &> /dev/null; then
    echo "❌ createdb не найден!"
    exit 1
fi

# Создаем базу данных
echo "📊 Создание базы данных 'bookstore'..."
if createdb bookstore 2>/dev/null; then
    echo "✅ База данных 'bookstore' создана"
else
    echo "⚠️  База данных 'bookstore' уже существует"
fi

# Создаем таблицы
echo "📋 Создание таблиц..."
if psql bookstore -f database/schema.sql; then
    echo "✅ Таблицы созданы успешно"
else
    echo "❌ Ошибка при создании таблиц"
    exit 1
fi

# Проверяем созданные таблицы
echo "🔍 Проверка созданных таблиц..."
psql bookstore -c "\dt"

echo ""
echo "🎉 База данных настроена успешно!"
echo ""
echo "📊 Информация о базе данных:"
echo "   База данных: bookstore"
echo "   Хост: localhost"
echo "   Порт: 5432"
echo "   Пользователь: postgres"
echo ""
echo "🧪 Тестовые пользователи:"
echo "   admin@bookstore.com / admin123"
echo "   user1@bookstore.com / user123"
echo "   user2@bookstore.com / user123"
echo "   customer@bookstore.com / customer123"
echo ""
echo "🚀 Для запуска бэкенд сервера:"
echo "   cd server"
echo "   npm install"
echo "   npm start"
echo ""
echo "🔧 Для подключения к базе данных:"
echo "   psql bookstore"
