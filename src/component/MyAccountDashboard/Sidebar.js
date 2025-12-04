import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom"
import Swal from 'sweetalert2';
import { logout as logoutAction } from '../../app/slices/user';
import AuthService from '../../services/AuthService';

const Sidebar = () => {
    const location = useLocation()
    let dispatch = useDispatch();
    const history = useHistory()
    let status = useSelector((state) => state.user.status);
    const authService = new AuthService();
    const isAdmin = authService.isAdmin();
    const logout = async () => {
        try {
            // Очищаем localStorage через AuthService
            const authService = new AuthService();
            await authService.logout();
            
            // Очищаем Redux store
            dispatch(logoutAction());
            
            Swal.fire({
                icon: 'success',
                title: 'Выход выполнен',
                text: 'Спасибо за использование нашего сервиса!'
            }).then(() => {
                history.push("/login");
            });
        } catch (error) {
            console.error('Logout error:', error);
            // Даже если ошибка, очищаем локальное состояние
            dispatch(logoutAction());
            history.push("/login");
        }
    }
    return (
        <>
            <div className="col-sm-12 col-md-12 col-lg-3">
                <div className="dashboard_tab_button">
                    <ul role="tablist" className="nav flex-column dashboard-list">
                        {/* <li><Link to="/my-account" className={location.pathname === '/my-account'?'active':null}><i className="fa fa-tachometer"></i>Dashboard</Link></li> */}
                        {!isAdmin && (
                            <li> <Link to="/my-account/customer-order" className={location.pathname === '/my-account/customer-order'?'active':null}><i className="fa fa-cart-arrow-down"></i>Orders</Link></li>
                        )}
                        {/* <li><Link to="/my-account/customer-download" className={location.pathname === '/my-account/customer-download'?'active':null}><i className="fa fa-cloud-download"></i>Downloads</Link></li> */}
                        {/* <li><Link to="/my-account/customer-address" className={location.pathname === '/my-account/customer-address'?'active':null}><i className="fa fa-map-marker"></i>Addresses</Link></li> */}
                        {isAdmin ? (
                            <li><Link to="/admin" className={location.pathname === '/admin'?'active':null}><i className="fa fa-cog"></i>Control Panel</Link></li>
                        ) : null}
                        {
                            status?<li><Link to="/#!" onClick={(e)=>{e.preventDefault();logout()}}><i className="fa fa-sign-out"></i>logout</Link></li>:null
                        }
                    </ul>
                </div>
            </div>
        </>
    )
}

export default Sidebar
