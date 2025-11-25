import {createSlice} from "@reduxjs/toolkit";
// Alert
import Swal from "sweetalert2";

// Product Slice
const productsSlice = createSlice({
    name: 'products',
    initialState: {
        products: [],
        carts: [],
        favorites: [],
        compare: [],
        single:null,
    },
    reducers: {
        // Load books from database and add to products
        loadBooksFromDB: (state, action) => {
            const books = action.payload;
            console.log('📦 Redux: loadBooksFromDB called with', books.length, 'books');
            // Заменяем продукты на книги из базы данных
            state.products = books;
            console.log('📦 Redux: Total products after adding books:', state.products.length);
        },
        // Set products
        setProducts: (state, action) => {
            state.products = action.payload;
        },
        // Get Single Product
        getProductById: (state, action) => {
            let { id } = action.payload;
            // Ищем продукт по ID, сравнивая как число и как строку
            let arr = state.products.find(item => {
                const itemId = typeof item.id === 'number' ? item.id : parseInt(item.id);
                const searchId = typeof id === 'number' ? id : parseInt(id);
                return itemId === searchId;
            });
            state.single = arr || null;
            console.log('🔍 getProductById: Searching for ID', id, 'Found:', arr ? 'Yes' : 'No');
        },
        // Set Single Product (для обновления продукта из API)
        setSingleProduct: (state, action) => {
            state.single = action.payload;
            console.log('✅ setSingleProduct: Updated product in store', action.payload);
            
            // Также обновляем продукт в списке products, если он там есть
            const productIndex = state.products.findIndex(item => {
                const itemId = typeof item.id === 'number' ? item.id : parseInt(item.id);
                const productId = typeof action.payload.id === 'number' ? action.payload.id : parseInt(action.payload.id);
                return itemId === productId;
            });
            
            if (productIndex !== -1) {
                state.products[productIndex] = action.payload;
                console.log('✅ Updated product in products array at index', productIndex);
            }
        },
        // Add to Cart
        addToCart: (state, action) =>{

            let { id } = action.payload;
            const productId = typeof id === 'string' ? parseInt(id) : id;

            // Check existance in cart
            let item = state.carts.find(i => {
                const itemId = typeof i.id === 'string' ? parseInt(i.id) : i.id;
                return itemId === productId;
            });
            
            if (item === undefined) {
                // Get Product
                let arr = state.products.find(item => {
                    const itemId = typeof item.id === 'string' ? parseInt(item.id) : item.id;
                    return itemId === productId;
                });
                
                if (arr === undefined) {
                    Swal.fire({
                        title: 'Error!',
                        text: 'Product not found',
                        icon: 'error',
                        showConfirmButton: false,
                        timer: 2500
                    });
                    return;
                }
                
                // Create a copy of the product to avoid mutating the original
                const productCopy = { ...arr };
                productCopy.quantity = 1;
                state.carts.push(productCopy);
                
                Swal.fire({
                    title: 'Success!',
                    text: 'Successfully added to your Cart',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 2500
                });

            }else{
                Swal.fire({
                    title: 'Failed!',
                    text: 'This product is already added in your Cart',
                    imageUrl: item.img,
                    imageWidth: 200,
                    imageAlt: item.title,
                    showConfirmButton: false,
                    timer: 5000
                })
            }
        },
        // Add to Compare
        addToComp: (state, action) =>{
            if (state.compare.length >= 3) {
                Swal.fire({
                    title: 'Failed!',
                    text: 'Compare List is Full',
                    icon: 'warning',
                    showConfirmButton: false,
                    timer: 2500,
                  })
                return;
            }

            let { id } = action.payload;
            const productId = typeof id === 'string' ? parseInt(id) : id;

            // Check existance
            let item = state.compare.find(i => {
                const itemId = typeof i.id === 'string' ? parseInt(i.id) : i.id;
                return itemId === productId;
            });
            
            if (item === undefined) {
                // Get Product
                let arr = state.products.find(item => {
                    const itemId = typeof item.id === 'string' ? parseInt(item.id) : item.id;
                    return itemId === productId;
                });
                
                if (arr === undefined) {
                    Swal.fire({
                        title: 'Error!',
                        text: 'Product not found',
                        icon: 'error',
                        showConfirmButton: false,
                        timer: 2500
                    });
                    return;
                }
                
                state.compare.push(arr);
                Swal.fire({
                    title: 'Success!',
                    text: 'Successfully added to Compare List',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 2500,
                  })
            }else{
                    Swal.fire({
                        title: 'Failed!',
                        text: 'Already Added in Compare List',
                        imageUrl: item.img,
                        imageWidth: 200,
                        imageAlt: item.title,
                        showConfirmButton: false,
                        timer: 5000,
                    })
              }
        },
        // Update Cart
        updateCart: (state, action) =>{
            let { val, id } = action.payload;
            const productId = typeof id === 'string' ? parseInt(id) : id;
            state.carts.forEach(item => {
                const itemId = typeof item.id === 'string' ? parseInt(item.id) : item.id;
                if(itemId === productId){
                    item.quantity = val
                }
            })

        },
        // Remove Cart
        removeCart: (state, action) =>{
            let { id } = action.payload;
            const productId = typeof id === 'string' ? parseInt(id) : id;
            let arr = state.carts.filter(item => {
                const itemId = typeof item.id === 'string' ? parseInt(item.id) : item.id;
                return itemId !== productId;
            });
            state.carts = arr
            
        },
        // Delete from Compare
        delCompare: (state, action) =>{
            let { id } = action.payload;
            const productId = typeof id === 'string' ? parseInt(id) : id;
            let arr = state.compare.filter(item => {
                const itemId = typeof item.id === 'string' ? parseInt(item.id) : item.id;
                return itemId !== productId;
            });
            state.compare = arr
            
        },
        // Clear Cart
        clearCart: (state) =>{
            state.carts = []
        },
        // Load Cart from Basket (при логине)
        loadCartFromBasket: (state, action) => {
            const basketItems = action.payload || [];
            console.log('🛒 Redux: loadCartFromBasket called with', basketItems.length, 'items');
            
            if (basketItems.length === 0) {
                state.carts = [];
                console.log('ℹ️ Redux: Basket is empty, clearing cart');
                return;
            }

            // Группируем записи Basket по ID_Book и суммируем Books_number
            // Если в Basket есть несколько записей с одинаковым ID_Book, объединяем их
            const groupedBasket = {};
            
            basketItems.forEach((basketItem) => {
                const ID_Book = basketItem.ID_Book;
                const Books_number = parseInt(basketItem.Books_number) || 1;
                
                if (groupedBasket[ID_Book]) {
                    // Если запись уже есть, суммируем количество
                    const existingQuantity = parseInt(groupedBasket[ID_Book].Books_number) || 1;
                    groupedBasket[ID_Book].Books_number = existingQuantity + Books_number;
                    console.log(`  ➕ Redux: Book ${ID_Book}: ${existingQuantity} + ${Books_number} = ${groupedBasket[ID_Book].Books_number}`);
                } else {
                    groupedBasket[ID_Book] = { ...basketItem, Books_number: Books_number };
                    console.log(`  ✨ Redux: Book ${ID_Book}: new entry with quantity ${Books_number}`);
                }
            });
            
            const groupedBasketItems = Object.values(groupedBasket);
            console.log('🛒 Redux: Grouped basket items:', {
                originalCount: basketItems.length,
                groupedCount: groupedBasketItems.length,
                groupedItems: groupedBasketItems.map(item => ({
                    ID_Book: item.ID_Book,
                    Books_number: item.Books_number
                }))
            });

            // Импортируем getBookImage для получения изображений
            const getBookImage = require('../../utils/bookImageLoader').getBookImage;
            
            // Конвертируем данные из Basket в формат для корзины Redux
            const cartItems = groupedBasketItems.map((basketItem) => {
                // Получаем информацию о книге из products, если она есть
                const bookProduct = state.products.find((product) => {
                    const productId = typeof product.id === 'string' ? parseInt(product.id) : product.id;
                    return productId === basketItem.ID_Book;
                });

                // Используем данные из products, если они есть, иначе из Basket
                const price = basketItem.hasDiscount && basketItem.discountedPrice 
                    ? basketItem.discountedPrice 
                    : parseFloat(basketItem.Book_Price) || 0;

                // Получаем изображение книги
                const bookImage = getBookImage(basketItem.ID_Book);

                return {
                    id: basketItem.ID_Book,
                    quantity: basketItem.Books_number || 1,
                    title: basketItem.Title || '',
                    price: price,
                    img: bookProduct?.img || bookImage || `/assets/img/book/${basketItem.ID_Book}.png`,
                    hover_img: bookProduct?.hover_img || bookImage || `/assets/img/book/${basketItem.ID_Book}.png`,
                    hasDiscount: basketItem.hasDiscount || false,
                    originalPrice: basketItem.originalPrice || parseFloat(basketItem.Book_Price) || 0,
                    discountedPrice: basketItem.discountedPrice || price,
                    discountPercent: basketItem.discountPercent || 0,
                    stock_quantity: basketItem.Stock_quantity || 0,
                    description: basketItem.Description || ''
                };
            });

            state.carts = cartItems;
            console.log('✅ Redux: Cart loaded from Basket:', cartItems.length, 'items');
        },
        // Add to Favorite / Wishlist
        addToFav: (state, action) =>{
            let { id } = action.payload;
            const productId = typeof id === 'string' ? parseInt(id) : id;

            // Check existance
            let item = state.favorites.find(i => {
                const itemId = typeof i.id === 'string' ? parseInt(i.id) : i.id;
                return itemId === productId;
            });
            
            if (item === undefined) {
                // Get Product
                let arr = state.products.find(item => {
                    const itemId = typeof item.id === 'string' ? parseInt(item.id) : item.id;
                    return itemId === productId;
                });
                
                if (arr === undefined) {
                    Swal.fire('Error', "Product not found", 'error');
                    return;
                }
                
                // Create a copy of the product to avoid mutating the original
                const productCopy = { ...arr };
                productCopy.quantity = 1;
                state.favorites.push(productCopy);
                Swal.fire('Success', "Added to Wishlist", 'success');
            }else{
                Swal.fire('Failed', "Already Added in Wishlist", 'warning');
            }
        },
        // Remove from Favorite / Wishlist
        removeFav: (state, action) =>{
            let { id } = action.payload;
            const productId = typeof id === 'string' ? parseInt(id) : id;
            let arr = state.favorites.filter(item => {
                const itemId = typeof item.id === 'string' ? parseInt(item.id) : item.id;
                return itemId !== productId;
            });
            state.favorites = arr
            
        },
    }
})

const productsReducer = productsSlice.reducer
export default productsReducer
