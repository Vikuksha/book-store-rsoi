import React from 'react'
import { Link } from 'react-router-dom'
import img1 from '../../assets/img/team/team1.avif'
const AccountDetails = () => {
    return (
        <>
            <div className="myaccount-content">
                <div className="save_button mt-3 d-flex align-items-center justify-content-between">
                    <h4 className="title">Account details</h4>
                    <Link to="/account-edit" className="theme-btn-one bg-black btn_sm">Update Account</Link>
                </div>
                <div className="login_form_container">
                    <div className="account_details_form">
                        <form action="#">
                            <div className="img_profiles">
                                <img src={img1} alt="img" />
                            </div>
                            {/* <div className="input-radio">
                                <span className="custom-radio">
                                    <input type="radio" defaultValue="1" name="mr" checked readOnly />Welcome</span>
                            </div> */}
                            <div className="default-form-box mb-20">
                                <label>Member Nick</label>
                                <input type="text" name="first-name" className="form-control" defaultValue=""
                                    readOnly />
                            </div>
                            <div className="default-form-box mb-20">
                                <label>Member Address</label>
                                <input type="text" name="last-name" className="form-control" defaultValue=""
                                    readOnly />
                            </div>
                            <div className="default-form-box mb-20">
                                <label>Member Phone</label>
                                <input type="text" name="email-name" defaultValue=""
                                    className="form-control" readOnly />
                            </div>
                            <div className="default-form-box mb-20">
                                <label>Member Password</label>
                                <input type="password" name="user-password" defaultValue=""
                                    className="form-control" readOnly />
                            </div>
                            <div className="default-form-box mb-20">
                                <label>Member Desc</label>
                                <input type="text" name="birthday" defaultValue=""
                                    className="form-control" readOnly />
                            </div>
                            {/* <span className="example">
                                (E.g.: 05/31/1970)
                            </span> */}
                            {/* <br />
                            <label className="checkbox-default" htmlFor="offer">
                                <input type="checkbox" id="offer" />
                                <span className="ml-2">Receive offers from our partners</span>
                            </label>
                            <br />
                            <label className="checkbox-default checkbox-default-more-text" htmlFor="newsletter">
                                <input type="checkbox" id="newsletter" />
                                <span className="ml-2">Sign up for our newsletter</span>
                                <p className="mt-2">You may unsubscribe at any
                                    moment. For that purpose, please find our contact info in the
                                    legal notice.</p>
                            </label> */}
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AccountDetails
