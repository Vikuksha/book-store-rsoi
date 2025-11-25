// Алгоритм расчёта скидки
function calculateDiscount(subtotal, orderQuantity) {
  let discount = 0;
  let discountPercent = 0;
  
  // Скидка 5% при заказе от 50$
  if (subtotal >= 50) {
    discountPercent = 5;
  }
  
  // Скидка 10% при заказе от 100$
  if (subtotal >= 100) {
    discountPercent = 10;
  }
  
  // Скидка 15% при заказе от 200$
  if (subtotal >= 200) {
    discountPercent = 15;
  }
  
  // Дополнительная скидка 2% при заказе 5+ книг
  if (orderQuantity >= 5) {
    discountPercent += 2;
  }
  
  // Максимальная скидка 20%
  if (discountPercent > 20) {
    discountPercent = 20;
  }
  
  discount = (subtotal * discountPercent) / 100;
  
  return {
    discount,
    discountPercent,
    finalTotal: subtotal - discount
  };
}

module.exports = calculateDiscount;

