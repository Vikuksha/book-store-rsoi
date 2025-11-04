import React from 'react'
import Map from './Map'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'

const ContactArea = () => {
    return (
      <>
        <section id="contact_area" className="ptb-100">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="contact_info">
                  <h3>Contact Information</h3>
                  <p>
                    At BookHeaven, your experience matters to us. We are
                    committed to making your journey through books smooth,
                    enjoyable, and inspiring. Whether you’re an avid reader, a
                    casual browser, or someone exploring new genres, we’re here
                    to support you every step of the way. If you have any
                    questions about our services, need help with your orders, or
                    encounter technical issues while using our platform, our
                    dedicated support team is ready to assist you. We also
                    welcome suggestions, feedback, or collaboration inquiries —
                    your input helps us grow and serve you better. From account
                    support and book recommendations to inquiries about delivery
                    or returns, no question is too small. We aim to respond to
                    all inquiries as quickly and efficiently as possible,
                    because we believe that excellent customer care is a key
                    part of your BookHeaven experience. We’re more than just an
                    online bookstore — we’re a growing community of book lovers,
                    and we’d love for you to be part of it. Feel free to reach
                    out to us anytime. Your voice is important, and we’re here
                    to listen.
                  </p>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-4">
                <div className="left_side_contact side_card">
                  <ul>
                    <li className="address_location">
                      <div className="contact_widget ">
                        <i className="fa fa-map-marker"></i>
                        <p>
                          서울특별시 마포구 와우산로29라길 15 <br /> 서울특별시
                          강남구
                        </p>
                      </div>
                    </li>
                    <li className="address_location">
                      <div className="contact_widget">
                        <i className="fa fa-phone"></i>
                        <Link to="/">821078964521</Link>
                      </div>
                      <div className="contact_widget">
                        <i className="fa fa-mobile"></i>
                        <Link to="/">821078964524</Link>
                      </div>
                    </li>
                    <li className="address_location">
                      <div className="contact_widget">
                        <i className="fa fa-envelope"></i>
                        <Link to="/">Email: bookheaven@example.com</Link>
                      </div>
                      <div className="contact_widget">
                        <i className="fa fa-globe"></i>
                        <Link to="/">BookHeaven.com</Link>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-lg-8">
                <div className="contact_form_one">
                  <h3>Get In Touch</h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      Swal.fire("Thank You", "We Got Your Message", "success");
                    }}
                  >
                    <div className="row">
                      <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                        <div className="form-group">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Name"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                        <div className="form-group">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Email"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                        <div className="form-group">
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Phone"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                        <div className="form-group">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Subject"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-lg-12 col-md-12 col-sm-12 col-12">
                        <div className="form-group">
                          <textarea
                            rows="7"
                            className="form-control"
                            placeholder="Message"
                          ></textarea>
                        </div>
                        <div className="submit_bitton_contact_one">
                          <button className="theme-btn-one btn-black-overlay btn_md">
                            Submit
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              <Map />
            </div>
          </div>
        </section>
      </>
    );
}

export default ContactArea