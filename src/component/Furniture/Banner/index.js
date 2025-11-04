import React from 'react'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { Link } from 'react-router-dom';

const Banner = () => {
    let settings = {
        arrows: false,
        dots: false,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 5000,
        slidesToShow: 1,
        slidesToScroll: 1,
        responsive: [{
            breakpoint: 1024,
            settings: {
              slidesToShow: 1,
            }
       
          },
           {
            breakpoint: 600, 
            settings: {
              slidesToShow: 1,
            }
          },
           {
            breakpoint: 480,
            settings: {
              slidesToShow: 1,
            }
          }
        ]
      };
    return (
      <>
        <section id="furniture_banner">
          <div className="furniture_slider_box">
            <Slider {...settings}>
              <div className="furniture_slider background_bg bg_1">
                <div className="container">
                  <div className="row">
                    <div className="col-lg-6 col-md-8 col-sm-12 col-12">
                      <div className="furniture_slider_content">
                        <h5> NEW BOOK</h5>
                        <h2> Book Collection</h2>
                        <p>This is the best BookStore!</p>
                        <Link
                          to="/shop"
                          className="theme-btn-one bg-black btn_sm"
                        >
                          Shop Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="furniture_slider background_bg bg_2">
                <div className="container">
                  <div className="row">
                    <div className="col-lg-6">
                      <div className="furniture_slider_content">
                        <h5> NEW BOOK</h5>
                        <h2> Book Collection</h2>
                        <p>This is the best BookStore!</p>
                        <Link
                          to="/shop"
                          className="theme-btn-one bg-black btn_sm"
                        >
                          Shop Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="furniture_slider background_bg bg_3">
                <div className="container">
                  <div className="row">
                    <div className="col-lg-6">
                      <div className="furniture_slider_content">
                        <h5> NEW BOOK</h5>
                        <h2> Book Collection</h2>
                        <p>This is the best BookStore!</p>
                        <Link
                          to="/shop"
                          className="theme-btn-one bg-black btn_sm"
                        >
                          Shop Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Slider>
          </div>
        </section>
      </>
    );
}


export default Banner
