-- Создание базы данных для книжного магазина
-- PostgreSQL Database Schema

-- Создание базы данных (выполнить от имени суперпользователя)
-- CREATE DATABASE bookstore;

-- Подключение к базе данных
-- \c bookstore;

-- Создание таблицы Users
CREATE TABLE IF NOT EXISTS "Users" (
    "ID" BIGSERIAL PRIMARY KEY,
    "Email" VARCHAR(500) UNIQUE NOT NULL,
    "Password" VARCHAR(255) NOT NULL,
    "First_name" VARCHAR(255) NOT NULL,
    "Last_name" VARCHAR(255) NOT NULL,
    "Phone" VARCHAR(255) NOT NULL,
    "Address" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы Book
CREATE TABLE IF NOT EXISTS "Book" (
    "ID" BIGSERIAL PRIMARY KEY,
    "Title" VARCHAR(255) NOT NULL,
    "Author" VARCHAR(255) NOT NULL,
    "Price" DECIMAL(10,2) NOT NULL,
    "Stock_quantity" INTEGER NOT NULL DEFAULT 0,
    "Publishing_year" INTEGER NOT NULL,
    "Description" TEXT,
    "Discount_percent" DECIMAL(5,2) DEFAULT 0 CHECK ("Discount_percent" >= 0 AND "Discount_percent" <= 100),
    "Genre" VARCHAR(255),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы Order
CREATE TABLE IF NOT EXISTS "Order" (
    "ID" BIGSERIAL PRIMARY KEY,
    "Total_order_quantity" INTEGER NOT NULL,
    "Order_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "Currency" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "Order_status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "Tracking_number" VARCHAR(255),
    "ID_User" BIGINT NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("ID_User") REFERENCES "Users"("ID") ON DELETE CASCADE
);

-- Автоматическое обновление типа данных Currency для существующей таблицы Order
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'Order'
        AND column_name = 'Currency'
        AND data_type != 'numeric'
    ) THEN
        ALTER TABLE "Order"
        ALTER COLUMN "Currency" TYPE DECIMAL(10,2) USING "Currency"::DECIMAL(10,2);
    END IF;
END $$;

-- Автоматическое добавление колонки Discount_percent в таблицу Book, если её нет
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'Book'
        AND column_name = 'Discount_percent'
    ) THEN
        ALTER TABLE "Book"
        ADD COLUMN "Discount_percent" DECIMAL(5,2) DEFAULT 0 CHECK ("Discount_percent" >= 0 AND "Discount_percent" <= 100);
    END IF;
END $$;

-- Автоматическое добавление колонки Genre в таблицу Book, если её нет
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'Book'
        AND column_name = 'Genre'
    ) THEN
        ALTER TABLE "Book"
        ADD COLUMN "Genre" VARCHAR(255);
    END IF;
END $$;

-- Создание таблицы Reviews
CREATE TABLE IF NOT EXISTS "Reviews" (
    "ID" BIGSERIAL PRIMARY KEY,
    "Grade" FLOAT NOT NULL CHECK ("Grade" >= 1 AND "Grade" <= 5),
    "Id_Book" BIGINT NOT NULL,
    "id_User" BIGINT NOT NULL,
    "Review" TEXT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("Id_Book") REFERENCES "Book"("ID") ON DELETE CASCADE,
    FOREIGN KEY ("id_User") REFERENCES "Users"("ID") ON DELETE CASCADE
    -- UNIQUE constraint удален: теперь пользователи могут оставлять несколько отзывов на одну книгу
);

-- Удаление UNIQUE constraint для таблицы Reviews (если он существует)
-- Это позволяет пользователям оставлять несколько отзывов на одну книгу
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Ищем UNIQUE constraint по колонкам Id_Book и id_User
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = '"Reviews"'::regclass
      AND contype = 'u'
      AND array_length(conkey, 1) = 2
      AND conkey[1] = (SELECT attnum FROM pg_attribute WHERE attrelid = '"Reviews"'::regclass AND attname = 'Id_Book')
      AND conkey[2] = (SELECT attnum FROM pg_attribute WHERE attrelid = '"Reviews"'::regclass AND attname = 'id_User');
    
    -- Если constraint найден, удаляем его
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE "Reviews" DROP CONSTRAINT IF EXISTS %I', constraint_name);
        RAISE NOTICE 'UNIQUE constraint % удален из таблицы Reviews', constraint_name;
    END IF;
END $$;

-- Создание таблицы Order_composition
CREATE TABLE IF NOT EXISTS "Order_composition" (
    "ID" BIGSERIAL PRIMARY KEY,
    "Books_number" INTEGER NOT NULL DEFAULT 1,
    "ID_Order" BIGINT NOT NULL,
    "ID_Book" BIGINT NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("ID_Order") REFERENCES "Order"("ID") ON DELETE CASCADE,
    FOREIGN KEY ("ID_Book") REFERENCES "Book"("ID") ON DELETE CASCADE
);

-- Создание таблицы Basket
CREATE TABLE IF NOT EXISTS "Basket" (
    "ID" BIGSERIAL PRIMARY KEY,
    "Books_number" INTEGER NOT NULL DEFAULT 1,
    "Payment" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "Discount_payment" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "ID_User" BIGINT NOT NULL,
    "ID_Book" BIGINT NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("ID_User") REFERENCES "Users"("ID") ON DELETE CASCADE,
    FOREIGN KEY ("ID_Book") REFERENCES "Book"("ID") ON DELETE CASCADE
);

-- Создание индексов для оптимизации
CREATE INDEX IF NOT EXISTS idx_users_email ON "Users"("Email");
CREATE INDEX IF NOT EXISTS idx_users_phone ON "Users"("Phone");
CREATE INDEX IF NOT EXISTS idx_book_title ON "Book"("Title");
CREATE INDEX IF NOT EXISTS idx_book_author ON "Book"("Author");
CREATE INDEX IF NOT EXISTS idx_order_user ON "Order"("ID_User");
CREATE INDEX IF NOT EXISTS idx_order_status ON "Order"("Order_status");
CREATE INDEX IF NOT EXISTS idx_reviews_book ON "Reviews"("Id_Book");
CREATE INDEX IF NOT EXISTS idx_reviews_user ON "Reviews"("id_User");
CREATE INDEX IF NOT EXISTS idx_order_composition_order ON "Order_composition"("ID_Order");
CREATE INDEX IF NOT EXISTS idx_order_composition_book ON "Order_composition"("ID_Book");
CREATE INDEX IF NOT EXISTS idx_basket_user ON "Basket"("ID_User");
CREATE INDEX IF NOT EXISTS idx_basket_book ON "Basket"("ID_Book");

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updated_at" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "Users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_book_updated_at BEFORE UPDATE ON "Book" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_updated_at BEFORE UPDATE ON "Order" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON "Reviews" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_composition_updated_at BEFORE UPDATE ON "Order_composition" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_basket_updated_at BEFORE UPDATE ON "Basket" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Вставка тестовых данных
INSERT INTO "Users" ("Email", "Password", "First_name", "Last_name", "Phone", "Address") VALUES
('admin@bookstore.com', '$2b$10$PsOBjiZmmLyZI.8eBmD7ae1EGLkYWDU555fDk.IYMbNas3CPXjzbK', 'Админ', 'Админов', '+7-999-123-45-67', 'Москва, ул. Административная, 1'),
('admin', '$2b$10$PsOBjiZmmLyZI.8eBmD7ae1EGLkYWDU555fDk.IYMbNas3CPXjzbK', 'admin', 'admin', '111111111', 'admin'),
('user1@bookstore.com', '$2b$10$rQZ8K9vX7wE2nF3mG4hI5uV6xC7yD8zA9bB0cC1dD2eE3fF4gG5hH6iI7jJ8kK9lL0mM1nN2oO3pP4qQ5rR6sS7tT8uU9vV0wW1xX2yY3zZ4', 'Иван', 'Иванов', '+7-999-234-56-78', 'Санкт-Петербург, ул. Пользовательская, 2'),
('user2@bookstore.com', '$2b$10$rQZ8K9vX7wE2nF3mG4hI5uV6xC7yD8zA9bB0cC1dD2eE3fF4gG5hH6iI7jJ8kK9lL0mM1nN2oO3pP4qQ5rR6sS7tT8uU9vV0wW1xX2yY3zZ4', 'Мария', 'Петрова', '+7-999-345-67-89', 'Казань, ул. Книжная, 3'),
('customer@bookstore.com', '$2b$10$rQZ8K9vX7wE2nF3mG4hI5uV6xC7yD8zA9bB0cC1dD2eE3fF4gG5hH6iI7jJ8kK9lL0mM1nN2oO3pP4qQ5rR6sS7tT8uU9vV0wW1xX2yY3zZ4', 'Алексей', 'Сидоров', '+7-999-456-78-90', 'Екатеринбург, ул. Покупательская, 4')
ON CONFLICT ("Email") DO NOTHING;

INSERT INTO "Book" ("Title", "Author", "Price", "Stock_quantity", "Publishing_year") VALUES
('Война и мир', 'Лев Толстой', 450.00, 15, 1869),
('Преступление и наказание', 'Фёдор Достоевский', 380.00, 12, 1866),
('Мастер и Маргарита', 'Михаил Булгаков', 420.00, 8, 1967),
('Евгений Онегин', 'Александр Пушкин', 320.00, 20, 1833),
('Анна Каренина', 'Лев Толстой', 400.00, 10, 1877),
('Отцы и дети', 'Иван Тургенев', 350.00, 14, 1862),
('Мёртвые души', 'Николай Гоголь', 360.00, 11, 1842),
('Герой нашего времени', 'Михаил Лермонтов', 340.00, 16, 1840)
ON CONFLICT DO NOTHING;

-- Создание пользователя для приложения (опционально)
-- CREATE USER bookstore_user WITH PASSWORD 'bookstore_password';
-- GRANT ALL PRIVILEGES ON DATABASE bookstore TO bookstore_user;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO bookstore_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO bookstore_user;

-- Проверка созданных таблиц
SELECT table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY table_name, ordinal_position;
