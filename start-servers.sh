#!/bin/bash

echo "🚀 Запуск BookStore - Frontend + Backend"
echo ""

# Остановка существующих процессов
echo "🛑 Остановка существующих процессов..."
pkill -f "react-scripts" 2>/dev/null
pkill -f "node server/server.js" 2>/dev/null
pkill -f "node server.js" 2>/dev/null
sleep 2

# Запуск бэкенд сервера в фоне
echo "📊 Запуск бэкенд сервера (порт 3003)..."
(cd server && node server.js > ../backend.log 2>&1) &
BACKEND_PID=$!

# Ждем запуска бэкенда
sleep 3

# Проверка бэкенда
if curl -s http://localhost:3003/api/health > /dev/null 2>&1; then
    echo "✅ Бэкенд сервер запущен (PID: $BACKEND_PID)"
else
    echo "❌ Ошибка запуска бэкенда"
    echo "Логи бэкенда:"
    cat backend.log
    exit 1
fi

# Запуск фронтенд сервера в фоне
echo "🌐 Запуск фронтенд сервера (порт 3000)..."
PORT=3000 BROWSER=none npm run client > frontend.log 2>&1 &
FRONTEND_PID=$!

# Ждем запуска фронтенда
sleep 15

# Проверка фронтенда
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Фронтенд сервер запущен (PID: $FRONTEND_PID)"
else
    echo "⚠️  Фронтенд сервер может быть еще запускается..."
    echo "Логи фронтенда:"
    tail -10 frontend.log
fi

echo ""
echo "🎉 Серверы запущены!"
echo "📊 Бэкенд API: http://localhost:3003"
echo "🌐 Фронтенд: http://localhost:3000"
echo ""
echo "Логи:"
echo "  Бэкенд: tail -f backend.log"
echo "  Фронтенд: tail -f frontend.log"
echo ""
echo "Нажмите Ctrl+C для остановки"

# Обработчик для остановки
cleanup() {
    echo ""
    echo "🛑 Остановка серверов..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    pkill -f "react-scripts" 2>/dev/null
    pkill -f "node server/server.js" 2>/dev/null
    pkill -f "node server.js" 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Ждем завершения
wait