// Скрипт для добавления тестовых пользователей в localStorage
// Запустите этот код в консоли браузера

const testUsers = [
  {
    ID: 1,
    Email: 'admin@bookstore.com',
    Password: 'admin123',
    First_name: 'Админ',
    Last_name: 'Админов',
    Phone: '+7-999-123-45-67',
    Address: 'Москва, ул. Административная, 1'
  },
  {
    ID: 2,
    Email: 'user1@bookstore.com',
    Password: 'user123',
    First_name: 'Иван',
    Last_name: 'Иванов',
    Phone: '+7-999-234-56-78',
    Address: 'Санкт-Петербург, ул. Пользовательская, 2'
  },
  {
    ID: 3,
    Email: 'user2@bookstore.com',
    Password: 'user123',
    First_name: 'Мария',
    Last_name: 'Петрова',
    Phone: '+7-999-345-67-89',
    Address: 'Казань, ул. Книжная, 3'
  },
  {
    ID: 4,
    Email: 'customer@bookstore.com',
    Password: 'customer123',
    First_name: 'Алексей',
    Last_name: 'Сидоров',
    Phone: '+7-999-456-78-90',
    Address: 'Екатеринбург, ул. Покупательская, 4'
  }
];

// Функция для добавления тестовых пользователей
function addTestUsers() {
  console.log('Добавляем тестовых пользователей...');
  
  // Сохраняем первого пользователя как текущего
  localStorage.setItem('userData', JSON.stringify(testUsers[0]));
  
  // Сохраняем всех пользователей в отдельном ключе
  localStorage.setItem('testUsers', JSON.stringify(testUsers));
  
  console.log('✅ Тестовые пользователи добавлены!');
  console.log('Текущий пользователь:', testUsers[0]);
  console.log('Всего пользователей:', testUsers.length);
}

// Функция для переключения между пользователями
function switchUser(userIndex) {
  if (userIndex >= 0 && userIndex < testUsers.length) {
    localStorage.setItem('userData', JSON.stringify(testUsers[userIndex]));
    console.log('✅ Переключились на пользователя:', testUsers[userIndex]);
  } else {
    console.log('❌ Неверный индекс пользователя');
  }
}

// Функция для очистки всех данных
function clearAllData() {
  localStorage.removeItem('userData');
  localStorage.removeItem('testUsers');
  localStorage.removeItem('memberData');
  localStorage.removeItem('cartData');
  console.log('✅ Все данные пользователей очищены');
}

// Функция для просмотра текущих пользователей
function viewCurrentUsers() {
  console.log('=== ТЕКУЩИЕ ПОЛЬЗОВАТЕЛИ ===');
  
  const userData = localStorage.getItem('userData');
  const testUsers = localStorage.getItem('testUsers');
  const memberData = localStorage.getItem('memberData');
  
  if (userData) {
    console.log('Текущий пользователь (userData):', JSON.parse(userData));
  }
  
  if (testUsers) {
    console.log('Все тестовые пользователи:', JSON.parse(testUsers));
  }
  
  if (memberData) {
    console.log('Данные участника (memberData):', JSON.parse(memberData));
  }
  
  if (!userData && !testUsers && !memberData) {
    console.log('❌ Нет данных пользователей');
  }
}

// Экспортируем функции в глобальную область
window.addTestUsers = addTestUsers;
window.switchUser = switchUser;
window.clearAllData = clearAllData;
window.viewCurrentUsers = viewCurrentUsers;

console.log('=== СКРИПТ ТЕСТОВЫХ ПОЛЬЗОВАТЕЛЕЙ ЗАГРУЖЕН ===');
console.log('Доступные команды:');
console.log('addTestUsers() - добавить тестовых пользователей');
console.log('switchUser(0) - переключиться на пользователя с индексом 0');
console.log('clearAllData() - очистить все данные');
console.log('viewCurrentUsers() - посмотреть текущих пользователей');
console.log('');
console.log('Пример использования:');
console.log('addTestUsers(); // Добавить тестовых пользователей');
console.log('switchUser(1); // Переключиться на второго пользователя');
console.log('viewCurrentUsers(); // Посмотреть всех пользователей');
