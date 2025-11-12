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
