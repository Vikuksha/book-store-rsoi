import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Swal from "sweetalert2";
import AuthService from "../../services/AuthService";
import { login as loginAction } from "../../app/slices/user";
import { getBookImage } from "../../utils/bookImageLoader";

const LoginArea = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const authService = new AuthService();

  const status = useSelector((state) => state.user.status);
  const user = useSelector((state) => state.user.user);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const login = async () => {
    if (status) {
      Swal.fire({
        icon: "question",
        title: user.name,
        html:
          "Вы уже вошли в систему <br />" + "Вы можете перейти на страницу <b>Магазин</b>",
      }).then((result) => {
        if (result.isConfirmed) {
          history.push("/");
        }
      });
      return;
    }

    if (!email || !password) {
      Swal.fire({
        icon: "error",
        title: "Ошибка",
        text: "Пожалуйста, заполните все поля",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.login({
        Email: email,
        Password: password
      });

      if (result.success) {
        // Обновляем Redux store для пользователя
        dispatch(loginAction({
          name: `${result.user.First_name} ${result.user.Last_name}`,
          email: result.user.Email,
          isAdmin: result.user.isAdmin || false
        }));

        // Загружаем корзину из Basket, если она есть
        if (result.basket && result.basket.length > 0) {
          console.log("🛒 Login: Loading cart from Basket:", result.basket.length, "items");
          
          // Конвертируем данные из Basket в формат для Redux cart
          const cartItems = result.basket.map((basketItem) => {
            const bookImage = getBookImage(basketItem.ID_Book);
            const price = basketItem.hasDiscount && basketItem.discountedPrice 
              ? basketItem.discountedPrice 
              : parseFloat(basketItem.Book_Price) || 0;

            return {
              id: basketItem.ID_Book,
              quantity: basketItem.Books_number || 1,
              title: basketItem.Title || '',
              price: price,
              img: bookImage,
              hover_img: bookImage,
              hasDiscount: basketItem.hasDiscount || false,
              originalPrice: basketItem.originalPrice || parseFloat(basketItem.Book_Price) || 0,
              discountedPrice: basketItem.discountedPrice || price,
              discountPercent: basketItem.discountPercent || 0,
              stock_quantity: basketItem.Stock_quantity || 0,
              description: basketItem.Description || ''
            };
          });

          // Загружаем корзину в Redux store
          dispatch({ 
            type: 'products/loadCartFromBasket', 
            payload: result.basket 
          });

          console.log("✅ Login: Cart loaded to Redux:", cartItems.length, "items");
        } else {
          // Если корзина пуста, очищаем Redux cart
          dispatch({ type: 'products/clearCart' });
          console.log("ℹ️ Login: Basket is empty, clearing cart");
        }

        Swal.fire({
          icon: "success",
          title: "Успешный вход",
          text: `Добро пожаловать, ${result.user.First_name}!`,
        }).then(() => {
          history.push("/");
        });
      } else {
        // Если пользователь не найден, перенаправляем на регистрацию
        if (result.redirectTo === 'register') {
          Swal.fire({
            icon: "info",
            title: "Пользователь не найден",
            text: result.message,
            showCancelButton: true,
            confirmButtonText: "Зарегистрироваться",
            cancelButtonText: "Попробовать еще раз"
          }).then((swalResult) => {
            if (swalResult.isConfirmed) {
              history.push("/register");
            }
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Ошибка входа",
            text: result.message,
          });
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      Swal.fire({
        icon: "error",
        title: "Ошибка",
        text: "Произошла ошибка при входе в систему",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="login_area" className="ptb-100">
      <div className="container">
        <div className="row">
          <div className="col-lg-6 offset-lg-3 col-md-12 col-sm-12 col-12">
            <div className="account_form">
              <h3>Login</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  login();
                }}
              >
                <div className="default-form-box">
                  <label>
                    Email<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Введите ваш email"
                  />
                </div>
                <div className="default-form-box">
                  <label>
                    Пароль<span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    required
                    minLength="5"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введите ваш пароль"
                  />
                </div>
                <div className="login_submit">
                  <button
                    className="theme-btn-one btn-black-overlay btn_md"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Вход..." : "Войти"}
                  </button>
                </div>
                <div className="remember_area">
                  {/* <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="materialUnchecked"
                    />
                    <label
                      className="form-check-label"
                      htmlFor="materialUnchecked"
                    >
                      Remember me
                    </label>
                  </div> */}
                </div>
                <Link to="/register" className="active">
                  Нет аккаунта? Зарегистрироваться
                </Link>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginArea;
