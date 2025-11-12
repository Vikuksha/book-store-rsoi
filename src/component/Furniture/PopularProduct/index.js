import React from 'react'
import Heading from '../Heading'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import ProductCard from '../Product/ProductCard';
import { useSelector } from "react-redux";

const PopularProduct = () => {
  let products = useSelector((state) => state.products.products);
  
  // Отладочная информация
  console.log('🏠 PopularProduct: Total products in store:', products.length);
  const books = products.filter(item => item.category === 'book');
  console.log('📚 PopularProduct: Books found:', books.length, books);
  
  // Показываем книги и мебель вместе
  // Сортируем так, чтобы книги были первыми
  products = products.filter(item => item.category === 'furniture' || item.category === 'book')
    .sort((a, b) => {
      // Книги (category === 'book') идут первыми
      if (a.category === 'book' && b.category !== 'book') return -1;
      if (a.category !== 'book' && b.category === 'book') return 1;
      return 0;
    });
  
  console.log('🏠 PopularProduct: Filtered products:', products.length);

    let settings = {
        arrows: false,
        dots: true,
        margin:30,
        infinite: true,
        speed: 500, 
        slidesToShow: 3,
        slidesToScroll: 1,
        responsive: [{
 
            breakpoint: 1024,
            settings: {
              slidesToShow: 3,
            }
          }, 
          {
            breakpoint: 768,
            settings: {
              slidesToShow: 2,
            }
          },
          {
            breakpoint: 600,
            settings: {
              slidesToShow: 2,
            }
          },
          {
            breakpoint: 480,
            settings: {
              slidesToShow: 1,
            }
          },
        ]
      };
    return (
      <>
        <section id="furniture_popular_product" className="ptb-100">
          <div className="container">
            <Heading heading={"Popular Book"} />
            <div className="row">
              <div className="col-lg-12">
                <div className="furniture_popular_slider">
                  <Slider {...settings}>
                    {products.length > 0 ? (
                      products.slice(0, 12).map((data, index) => (
                        <div className="popular-product-wrapper" key={data.id || index}>
                          <ProductCard data={data} />
                        </div>
                      ))
                    ) : (
                      <div className="popular-product-wrapper">
                        <p>Загрузка книг...</p>
                      </div>
                    )}
                  </Slider>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
}

export default PopularProduct
