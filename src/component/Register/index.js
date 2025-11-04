import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { useHistory, Link } from "react-router-dom";
import AuthService from "../../services/AuthService";
import { register as registerAction } from "../../app/slices/user";

const RegisterArea = () => {
  let dispatch = useDispatch();
  const history = useHistory();
  const authService = new AuthService();

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  let status = useSelector((state) => state.user.status);
  let userData = useSelector((state) => state.user.user);

  // Валидация формы
  const validateForm = () => {
    if (!email || !firstName || !lastName || !phone || !password || !confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Ошибка",
        text: "Пожалуйста, заполните все поля",
      });
      return false;
    }

    if (password !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Ошибка",
        text: "Пароли не совпадают",
      });
      return false;
    }

    if (password.length < 5) {
      Swal.fire({
        icon: "error",
        title: "Ошибка",
        text: "Пароль должен содержать минимум 5 символов",
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Swal.fire({
        icon: "error",
        title: "Ошибка",
        text: "Пожалуйста, введите корректный email",
      });
      return false;
    }

    return true;
  };

  // Регистрация пользователя
  const register = async () => {
    if (status) {
      Swal.fire({
        icon: "question",
        title: userData.name,
        html:
          "Вы уже зарегистрированы <br />" +
          "Вы можете перейти на страницу <b>Магазин</b>",
      }).then((result) => {
        if (result.isConfirmed) {
          history.push("/");
        }
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.register({
        Email: email,
        Password: password,
        First_name: firstName,
        Last_name: lastName,
        Phone: phone,
        Address: address
      });

      if (result.success) {
        // Обновляем Redux store
        dispatch(registerAction({
          name: `${result.user.First_name} ${result.user.Last_name}`,
          email: result.user.Email
        }));

        Swal.fire({
          icon: "success",
          title: "Регистрация успешна",
          text: `Добро пожаловать, ${result.user.First_name}!`,
        }).then(() => {
          history.push("/");
        });
      } else {
        // Если пользователь уже существует, предлагаем войти
        if (result.redirectTo === 'login') {
          Swal.fire({
            icon: "info",
            title: "Пользователь уже существует",
            text: result.message,
            showCancelButton: true,
            confirmButtonText: "Войти",
            cancelButtonText: "Попробовать другой email"
          }).then((swalResult) => {
            if (swalResult.isConfirmed) {
              history.push("/login");
            }
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Ошибка регистрации",
            text: result.message,
          });
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      Swal.fire({
        icon: "error",
        title: "Ошибка",
        text: "Произошла ошибка при регистрации",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <section id="login_area" className="ptb-100">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 offset-lg-3 col-md-12 col-sm-12 col-12">
              <div className="account_form">
                <h3>Регистрация</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    register();
                  }}
                >
                  <div className="default-form-box">
                    <label>
                      Email<span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.currentTarget.value)}
                      required
                      placeholder="Введите ваш email"
                    />
                  </div>
                  <div className="default-form-box">
                    <label>
                      Имя<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={firstName}
                      onChange={(e) => setFirstName(e.currentTarget.value)}
                      required
                      placeholder="Введите ваше имя"
                    />
                  </div>
                  <div className="default-form-box">
                    <label>
                      Фамилия<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={lastName}
                      onChange={(e) => setLastName(e.currentTarget.value)}
                      required
                      placeholder="Введите вашу фамилию"
                    />
                  </div>
                  <div className="default-form-box">
                    <label>
                      Телефон<span className="text-danger">*</span>
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      value={phone}
                      onChange={(e) => setPhone(e.currentTarget.value)}
                      required
                      placeholder="Введите ваш телефон"
                    />
                  </div>
                  <div className="default-form-box">
                    <label>
                      Адрес<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={address}
                      onChange={(e) => setAddress(e.currentTarget.value)}
                      required
                      placeholder="Введите ваш адрес"
                    />
                  </div>
                  <div className="default-form-box">
                    <label>
                      Пароль<span className="text-danger">*</span>
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.currentTarget.value)}
                      required
                      minLength="5"
                      placeholder="Введите пароль (минимум 5 символов)"
                    />
                  </div>
                  <div className="default-form-box">
                    <label>
                      Подтвердите пароль<span className="text-danger">*</span>
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                      required
                      minLength="5"
                      placeholder="Подтвердите пароль"
                    />
                  </div>
                  <div className="login_submit">
                    <button
                      className="theme-btn-one btn-black-overlay btn_md"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? "Регистрация..." : "Зарегистрироваться"}
                    </button>
                  </div>
                  <div className="remember_area">
                    <Link to="/login" className="active">
                      Уже есть аккаунт? Войти
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default RegisterArea;
