// Butun loyihada ishltyotgan malumotlarning type integration

import { Member } from "./member";
import { Order } from "./order";
import { Product } from "./product";

/** REACT APP STATE **/
export interface AppRootState {
    homepage: HomePageState;
    productsPage: ProductsPageState;
    ordersPage: OrdersPageState;
}

/** HOMEPAGE **/  // HOMEPAGE screen componentiga oid malumotlar
export interface HomePageState {
    popularDishes: Product[];
    newDishes: Product[];
    topUsers: Member[];
}


/** PRODUCTS PAGE **/
export interface ProductsPageState {
    restaurant: Member | null;
    chosenProduct: Product | null;
    products: Product[];
}

/** ORDERS PAGE **/
export interface OrdersPageState {
    pausedOrders: Order[];
    processOrders: Order[];
    finishedOrders: Order[];
}