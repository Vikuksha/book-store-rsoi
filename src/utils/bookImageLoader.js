// Функция для получения пути к изображению книги
// Использует require.context для динамической загрузки всех изображений из папки book

// Загружаем все изображения из папки book используя require.context
// Это позволяет webpack обработать все файлы во время сборки
const bookImagesContext = require.context('../assets/img/book', false, /\.(png|jpg|jpeg)$/);

// Создаем мапу всех доступных изображений книг
const bookImagesMap = {};
const imageKeys = bookImagesContext.keys();
console.log('🖼️ BookImageLoader: Found images:', imageKeys);

imageKeys.forEach((item) => {
  // Извлекаем ID из имени файла (например, './1.png' -> '1')
  const bookId = item.replace('./', '').replace(/\.(png|jpg|jpeg)$/, '');
  bookImagesMap[bookId] = bookImagesContext(item);
  console.log(`🖼️ BookImageLoader: Mapped book ID ${bookId} to image`);
});

console.log('🖼️ BookImageLoader: Total images mapped:', Object.keys(bookImagesMap).length);

// Placeholder изображение
let placeholderImage = null;
try {
  placeholderImage = require('../assets/img/common/common_bg.png');
} catch (e) {
  // Если placeholder не найден, используем пустую строку
  console.warn('Placeholder image not found');
}

export const getBookImage = (bookId) => {
  // Преобразуем bookId в строку для поиска
  const bookIdStr = String(bookId);
  
  console.log(`🖼️ getBookImage: Looking for book ID ${bookIdStr}, available IDs:`, Object.keys(bookImagesMap));
  
  // Проверяем, есть ли изображение в мапе
  if (bookImagesMap[bookIdStr]) {
    console.log(`✅ getBookImage: Found image for book ID ${bookIdStr}`);
    return bookImagesMap[bookIdStr];
  }

  // Если изображение не найдено, возвращаем placeholder
  console.warn(`⚠️ getBookImage: Image not found for book ID ${bookIdStr}, using placeholder`);
  return placeholderImage || '';
};

export default getBookImage;

