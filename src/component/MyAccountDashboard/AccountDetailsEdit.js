import React from "react";
import { Link, useHistory } from "react-router-dom";

import img1 from "../../assets/img/team/team1.avif";

const AccountDetailsEdit = () => {
  const history = useHistory();
  const routeChange = () => {
    history.goBack();
  };
  return (
    <>
      <section id="account_edit" className="pt-100 pb-100">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div className="back_btn">
                <Link to="/" onClick={routeChange}>
                  <i className="fa fa-arrow-left"></i>Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-3">
              <div className="account_thumd">
                <div className="account_thumb_img">
                  <img src={img1} alt="img" />
                  <div className="fixed_icon">
                    <input type="file" />
                    <i className="fa fa-camera"></i>
                  </div>
                </div>
                <h4>Robert Downey</h4>
                {/* <p>UX/UI Designer</p> */}
              </div>
            </div>
            <div className="col-lg-9">
              <div className="account_setting">
                <div className="account_setting_heading">
                  <h2>Account Details</h2>
                  {/* <p>Edit your account settings and change your password here.</p> */}
                </div>
                <form
                  id="account_info_form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    history.push("/");
                  }}
                >
                  {/* <div className="input-radio">
                                <span className="custom-radio"><input type="radio" value="1" name="id_gender" defaultChecked/> Mr.</span>
                                <span className="custom-radio"><input type="radio" value="1" name="id_gender"/> Mrs.</span>
                            </div> */}
                  <div className="form-group">
                    <label htmlFor="m_nick">Member Nick</label>
                    <input
                      type="text"
                      className="form-control"
                      id="f_name"
                      placeholder=""
                      required
                    />
                    {/* <input type="text" className="form-control" placeholder="Dhoe" required /> */}
                  </div>
                  <div className="form-group">
                    <label htmlFor="_m_desc">Member Desc</label>
                    <input
                      type="text"
                      className="form-control"
                      id="m_desc"
                      placeholder=""
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="m_address">Member Address</label>
                    <input
                      type="text"
                      className="form-control"
                      id="m_address"
                      placeholder=""
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="m_phone">Member Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      id="m_phone"
                      placeholder=""
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="current_password">Member Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="current_password"
                      placeholder=""
                      required
                    />
                    {/* <input
                      type="password"
                      className="form-control"
                      id="new_password"
                      placeholder="Enter your new password"
                      required
                    /> */}
                    {/* <input
                      type="password"
                      className="form-control"
                      id="re_password"
                      placeholder="Re-type your new password"
                      required
                    /> */}
                  </div>
                  <button
                    type="submit"
                    className="theme-btn-one bg-black btn_sm"
                  >
                    Update Information
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AccountDetailsEdit;
