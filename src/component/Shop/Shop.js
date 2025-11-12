import React, { useState, useEffect } from 'react'
import ProductCard from '../Common/Product/ProductCard'
import Filter from './Filter'
import { useSelector } from "react-redux";

const Shop = () => {
    const allProducts = useSelector((state) => state.products.products);
    const [products, setProducts] = useState(allProducts)
    const [page, setPage] = useState(1)
    const [filterOptions, setFilterOptions] = useState({
        inStock: false,
        sortBy: 'newest'
    })

    // Отладочная информация
    useEffect(() => {
        console.log('🛒 Shop: Total products in store:', allProducts.length);
        const books = allProducts.filter(item => item.category === 'book');
        console.log('📚 Shop: Books found:', books.length, books);
    }, [allProducts]);

    // Применяем фильтры и сортировку
    useEffect(() => {
        let filtered = [...allProducts];
        
        // Фильтрация по наличию на складе
        if (filterOptions.inStock) {
            filtered = filtered.filter(item => {
                // Проверяем stock_quantity из базы данных
                if (item.stock_quantity !== undefined) {
                    return item.stock_quantity > 0;
                }
                return true;
            });
        }
        
        // Сортировка
        filtered = sortProducts(filtered, filterOptions.sortBy);
        
        setProducts(filtered);
        console.log('🛒 Shop: Filtered and sorted products:', filtered.length);
    }, [allProducts, filterOptions]);

    // Алгоритм сортировки
    const sortProducts = (productsList, sortBy) => {
        const sorted = [...productsList];
        
        switch (sortBy) {
            case 'price_asc':
                return sorted.sort((a, b) => {
                    const priceA = typeof a.price === 'number' ? a.price : parseFloat(a.price) || 0;
                    const priceB = typeof b.price === 'number' ? b.price : parseFloat(b.price) || 0;
                    return priceA - priceB;
                });
            
            case 'price_desc':
                return sorted.sort((a, b) => {
                    const priceA = typeof a.price === 'number' ? a.price : parseFloat(a.price) || 0;
                    const priceB = typeof b.price === 'number' ? b.price : parseFloat(b.price) || 0;
                    return priceB - priceA;
                });
            
            case 'rating_desc':
                return sorted.sort((a, b) => {
                    const ratingA = a.rating?.rate || 0;
                    const ratingB = b.rating?.rate || 0;
                    return ratingB - ratingA;
                });
            
            case 'popularity':
                return sorted.sort((a, b) => {
                    const countA = a.rating?.count || 0;
                    const countB = b.rating?.count || 0;
                    if (countA !== countB) return countB - countA;
                    // Если количество отзывов одинаковое, сортируем по рейтингу
                    const ratingA = a.rating?.rate || 0;
                    const ratingB = b.rating?.rate || 0;
                    return ratingB - ratingA;
                });
            
            case 'newest':
                return sorted.sort((a, b) => {
                    // Книги идут первыми, затем по дате создания
                    if (a.category === 'book' && b.category !== 'book') return -1;
                    if (a.category !== 'book' && b.category === 'book') return 1;
                    return 0;
                });
            
            case 'title_asc':
                return sorted.sort((a, b) => {
                    const titleA = (a.title || '').toLowerCase();
                    const titleB = (b.title || '').toLowerCase();
                    return titleA.localeCompare(titleB);
                });
            
            default:
                return sorted;
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilterOptions(prev => ({ ...prev, ...newFilters }));
    };

    const randProduct = (page) => {
        if (page) {
            setPage(page);
        }
    }

    return (
      <>
        <section id="shop_main_area" className="ptb-100">
          <div className="container">
            <div className="row">
              {/* Боковая панель с фильтрами слева */}
              <div className="col-lg-3 col-md-12" style={{ marginBottom: '30px' }}>
                <Filter filterEvent={randProduct} onFilterChange={handleFilterChange} filterOptions={filterOptions} />
              </div>
              
              {/* Основная область с товарами справа */}
              <div className="col-lg-9 col-md-12">
                <div className="row">
                  {products.length > 0 ? (
                    products.map((data, index) => (
                      <div className="col-lg-4 col-md-6 col-sm-6 col-12" key={data.id || index}>
                        <ProductCard data={data} />
                      </div>
                    ))
                  ) : (
                    <div className="col-12">
                      <p>Загрузка продуктов...</p>
                    </div>
                  )}
                </div>
                <div className="col-lg-12">
                  <ul className="pagination" style={{ marginBottom: "20px" }}>
                    <li
                      className="page-item"
                      onClick={(e) => {
                        randProduct(page > 1 ? page - 1 : 0);
                      }}
                    >
                      <a className="page-link" href="#!" aria-label="Previous">
                        <span aria-hidden="true">«</span>
                      </a>
                    </li>
                    <li
                      className={"page-item " + (page === 1 ? "active" : null)}
                      onClick={(e) => {
                        randProduct(1);
                      }}
                    >
                      <a className="page-link" href="#!">
                        1
                      </a>
                    </li>
                    <li
                      className={"page-item " + (page === 2 ? "active" : null)}
                      onClick={(e) => {
                        randProduct(2);
                      }}
                    >
                      <a className="page-link" href="#!">
                        2
                      </a>
                    </li>
                    <li
                      className={"page-item " + (page === 3 ? "active" : null)}
                      onClick={(e) => {
                        randProduct(3);
                      }}
                    >
                      <a className="page-link" href="#!">
                        3
                      </a>
                    </li>
                    <li
                      className="page-item"
                      onClick={(e) => {
                        randProduct(page < 3 ? page + 1 : 0);
                      }}
                    >
                      <a className="page-link" href="#!" aria-label="Next">
                        <span aria-hidden="true">»</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
}

export default Shop
