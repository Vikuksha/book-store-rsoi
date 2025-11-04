import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

const TotalCart = (props) => {
  let carts = useSelector((state) => state.products.carts);

  const cartTotal = () => {
    return carts.reduce(function (total, item) {
      return total + (item.quantity || 1) * item.price;
    }, 0);
  };

  const handleCheckout = (e) => {
    e.preventDefault(); // Default behaviorni to'xtatish
    Swal.fire({
      icon: "success",
      title: "Successfully shopping!",
      text: "Your order has been placed.",
      confirmButtonText: "OK",
    }).then(() => {
      // Agar SweetAlertdan OK bosilsa, checkout sahifasiga o'tish
      window.location.href = props.fullGrid ? "/order-success" : "/";
    });
  };

  return (
    <div
      className={props.fullGrid ? "col-lg-12 col-md-12" : "col-lg-6 col-md-6"}
    >
      <div className="coupon_code right">
        <h3>Cart Total</h3>
        <div className="coupon_inner">
          <div className="cart_subtotal">
            <p>Subtotal</p>
            <p className="cart_amount">${cartTotal()}.00</p>
          </div>
          <div className="cart_subtotal ">
            <p>Shipping</p>
            <p className="cart_amount">
              <span>Flat Rate:</span> $00
            </p>
          </div>
          {/* <a href="#!">Calculate shipping</a> */}

          <div className="cart_subtotal">
            <p>Total</p>
            <p className="cart_amount">${cartTotal()}.00</p>
          </div>
          <div className="checkout_btn">
            <Link
              to="#!"
              className="theme-btn-one btn-black-overlay btn_sm"
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalCart;
