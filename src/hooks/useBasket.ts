import { useState } from "react";
import { CartItem } from "../lib/types/search";

const useBasket = () => {
  const cartJson: string | null = localStorage.getItem("cartData"); // localStorage dan cartData key ni oladi
  const currentCart = cartJson ? JSON.parse(cartJson) : []; // cartJson bor bolsa, JSON.parse qladi, aks holda bosh array: jsondan obj ga ayltrladi
  const [cartItems, setCartItems] = useState<CartItem[]>(currentCart);

  /** HANDLERS **/
  // DEFINE
  const onAdd = (input: CartItem) => { 
    const exist: any = cartItems.find(
      (item: CartItem) => item._id === input._id
    ); // har bitta item oberadi, bz qoshmoqchi bolgan inputimzni idsini uning icidagi mavjud bolgan itemlarni idsi bn solshtraldi
    if (exist) {
      // qayta usha item qoshganda faqat quantity yangilanadi xolos
      const cartUptade = cartItems.map(
        (item: CartItem) =>
          item._id === input._id
            ? { ...exist, quantity: exist.quantity + 1 }
            : item // agar item._id va input._id bir xil bolsa, quantity ni 1 ga oshiradi, aks holda itemni qaytaradi
      );
      setCartItems(cartUptade); // cartItemsni yangiladi
      localStorage.setItem("cartData", JSON.stringify(cartUptade)); // localStorage yanglanadi
    } else {
      // 1-chi marta item qoshganda
      const cartUptade = [...cartItems, { ...input }]; //krb kelgan inputni qoshgan holda yangi [] ni hosl qberadi
      setCartItems(cartUptade); // cartItemsni yangiladi
      localStorage.setItem("cartData", JSON.stringify(cartUptade)); // cartData nomi bn cartUptade ni stringga aylantirib saqlaydi => localStoragega
    }
  };

  const onRemove = (input: CartItem) => {
    const exist: any = cartItems.find(
      (item: CartItem) => item._id === input._id
    );
    if (exist.quantity === 1) {
      const cartUptade = cartItems.filter(
        (item: CartItem) => item._id !== input._id
      ); // existi butunlay ochrb beradi, unga teng bolmagan barcha elementlarni cartUpdatega qaytaradi
      setCartItems(cartUptade); // cartItemsni yangiladi
      localStorage.setItem("cartData", JSON.stringify(cartUptade));
    } else {  
      const cartUptade = cartItems.map((item: CartItem) =>
        item._id === input._id // remove qlyotgan productni topb berb
          ? { ...exist, quantity: exist.quantity - 1 } // quantityni 1 ga kamaytiradi
          : item // qolgan productlarni qaytaradi va cartUpdate ga joyledi
      );
      setCartItems(cartUptade); // cartItemsni yangiladi
      localStorage.setItem("cartData", JSON.stringify(cartUptade));
    }
  };

  const onDelete = (input: CartItem) => {
    const cartUptade = cartItems.filter(
        (item: CartItem) => item._id !== input._id // teng bolmagan idni topb bersa ochrb tshedi
    );
    setCartItems(cartUptade);
    localStorage.setItem("cartData", JSON.stringify(cartUptade));
  };

  const onDeleteAll = () => {
    setCartItems([]);  // bosh arrayga aylntrb beradi
    localStorage.removeItem("cartData"); // localStorageni ham tozalab beradi
  }

  return {
    cartItems,
    onAdd,
    onRemove,
    onDelete,
    onDeleteAll, 
  };
};

export default useBasket;
