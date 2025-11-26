import React, { useState, useEffect } from 'react'
import ProductCard from '../Common/Product/ProductCard'
import Filter from './Filter'
import { useSelector } from "react-redux";

const Shop = () => {
    const allProducts = useSelector((state) => state.products.products);
    const [products, setProducts] = useState(allProducts)
    const [page, setPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterOptions, setFilterOptions] = useState({
        inStock: false,
        hasDiscount: false,
        sortBy: 'newest',
        selectedAuthors: [],
        selectedYears: []
    })
    

    // Получаем уникальные авторы и годы для фильтров
    const getUniqueValues = () => {
        const authors = new Set();
        const years = new Set();
        
        allProducts.forEach(item => {
            // Получаем автора из поля author или из description
            if (item.author) {
                authors.add(item.author.trim());
            } else if (item.description) {
                const authorMatch = item.description.match(/Author:\s*([^,]+)/);
                if (authorMatch) {
                    authors.add(authorMatch[1].trim());
                }
            }
            // Получаем год из поля publishing_year или из description
            if (item.publishing_year) {
                years.add(item.publishing_year);
            } else if (item.description) {
                const yearMatch = item.description.match(/Published:\s*(\d{4})/);
                if (yearMatch) {
                    years.add(parseInt(yearMatch[1]));
                }
            }
        });
        
        return {
            authors: Array.from(authors).sort(),
            years: Array.from(years).sort((a, b) => b - a) // Сортируем по убыванию
        };
    };

    const uniqueValues = getUniqueValues();

    // Отладочная информация
    useEffect(() => {
        console.log('🛒 Shop: Total products in store:', allProducts.length);
        const books = allProducts.filter(item => item.category === 'book');
        console.log('📚 Shop: Books found:', books.length, books);
    }, [allProducts]);

    // Применяем фильтры, поиск и сортировку
    useEffect(() => {
        let filtered = [...allProducts];
        
        // Поиск по названию книги
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(item => {
                const title = (item.title || '').toLowerCase();
                return title.includes(query);
            });
        }
        
        // Фильтрация по авторам (множественный выбор)
        if (filterOptions.selectedAuthors && filterOptions.selectedAuthors.length > 0) {
            filtered = filtered.filter(item => {
                // Используем поле author, если есть, иначе парсим description
                let author = item.author;
                if (!author && item.description) {
                    const authorMatch = item.description.match(/Author:\s*([^,]+)/);
                    if (authorMatch) {
                        author = authorMatch[1].trim();
                    }
                }
                return author && filterOptions.selectedAuthors.includes(author);
            });
        }
        
        // Фильтрация по годам публикации (множественный выбор)
        if (filterOptions.selectedYears && filterOptions.selectedYears.length > 0) {
            filtered = filtered.filter(item => {
                // Используем поле publishing_year, если есть, иначе парсим description
                let year = item.publishing_year;
                if (!year && item.description) {
                    const yearMatch = item.description.match(/Published:\s*(\d{4})/);
                    if (yearMatch) {
                        year = parseInt(yearMatch[1]);
                    }
                }
                return year && filterOptions.selectedYears.includes(year);
            });
        }
        
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
        
        // Фильтрация по наличию скидки
        if (filterOptions.hasDiscount) {
            filtered = filtered.filter(item => {
                return item.hasDiscount === true || (item.discountPercent && item.discountPercent > 0);
            });
        }
        
        // Сортировка
        filtered = sortProducts(filtered, filterOptions.sortBy);
        
        setProducts(filtered);
        console.log('🛒 Shop: Filtered and sorted products:', filtered.length);
        
        // Сбрасываем на первую страницу только если фильтры не активны
        const filtersActive = (
            searchQuery.trim() !== '' ||
            (filterOptions.selectedAuthors && filterOptions.selectedAuthors.length > 0) ||
            (filterOptions.selectedYears && filterOptions.selectedYears.length > 0) ||
            filterOptions.inStock === true ||
            filterOptions.hasDiscount === true
        );
        if (!filtersActive) {
            setPage(1);
        }
    }, [allProducts, filterOptions, searchQuery]);

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

    // Проверяем, применены ли фильтры
    const hasActiveFilters = () => {
        return (
            searchQuery.trim() !== '' ||
            (filterOptions.selectedAuthors && filterOptions.selectedAuthors.length > 0) ||
            (filterOptions.selectedYears && filterOptions.selectedYears.length > 0) ||
            filterOptions.inStock === true ||
            filterOptions.hasDiscount === true
        );
    };

    const filtersActive = hasActiveFilters();
    
    // Константы для пагинации (только для неотфильтрованных книг)
    const ITEMS_PER_PAGE = filtersActive ? products.length : Math.ceil(products.length / 3) || 1;
    const totalPages = filtersActive ? 1 : Math.max(1, Math.ceil(products.length / ITEMS_PER_PAGE));
    
    // Получаем книги для текущей страницы
    const getPaginatedProducts = () => {
        // Если фильтры применены - показываем все книги на одной странице
        if (filtersActive) {
            return products;
        }
        // Если фильтры не применены - разбиваем на страницы
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return products.slice(startIndex, endIndex);
    };
    
    const paginatedProducts = getPaginatedProducts();

    const handleFilterChange = (newFilters) => {
        setFilterOptions(prev => ({ ...prev, ...newFilters }));
        // Сбрасываем на первую страницу только если фильтры были сняты
        const newFiltersState = { ...filterOptions, ...newFilters };
        const willHaveFilters = (
            searchQuery.trim() !== '' ||
            (newFiltersState.selectedAuthors && newFiltersState.selectedAuthors.length > 0) ||
            (newFiltersState.selectedYears && newFiltersState.selectedYears.length > 0) ||
            newFiltersState.inStock === true ||
            newFiltersState.hasDiscount === true
        );
        if (!willHaveFilters) {
            setPage(1);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            // Прокручиваем вверх страницы
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    return (
      <>
        <section id="shop_main_area" className="ptb-100">
          <div className="container">
            <div className="row">
              {/* Боковая панель с фильтрами слева */}
              <div className="col-lg-3 col-md-12" style={{ marginBottom: '30px' }}>
                <Filter 
                  onFilterChange={handleFilterChange} 
                  filterOptions={filterOptions}
                  uniqueAuthors={uniqueValues.authors}
                  uniqueYears={uniqueValues.years}
                />
              </div>
              
              {/* Основная область с товарами справа */}
              <div className="col-lg-9 col-md-12">
                {/* Поисковая строка */}
                <div className="row" style={{ marginBottom: '30px' }}>
                  <div className="col-12">
                    <div className="search-box" style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Поиск книг по названию..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                          padding: '12px 45px 12px 15px',
                          fontSize: '16px',
                          borderRadius: '5px',
                          border: '1px solid #ddd',
                          width: '100%'
                        }}
                      />
                      <i 
                        className="fa fa-search" 
                        style={{
                          position: 'absolute',
                          right: '15px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#999',
                          fontSize: '18px'
                        }}
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          style={{
                            position: 'absolute',
                            right: '40px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: '#999',
                            cursor: 'pointer',
                            fontSize: '18px',
                            padding: '0'
                          }}
                        >
                          <i className="fa fa-times" />
                        </button>
                      )}
                    </div>
                    {searchQuery && (
                      <p style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>
                        Найдено книг: {products.length}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="row">
                  {paginatedProducts.length > 0 ? (
                    paginatedProducts.map((data, index) => (
                      <div className="col-lg-4 col-md-6 col-sm-6 col-12" key={data.id || index}>
                        <ProductCard data={data} />
                      </div>
                    ))
                  ) : (
                    <div className="col-12">
                      <p>{searchQuery || filterOptions.selectedAuthors.length > 0 || filterOptions.selectedYears.length > 0 
                        ? 'Книги не найдены. Попробуйте другой запрос или измените фильтры.' 
                        : 'Загрузка продуктов...'}</p>
                    </div>
                  )}
                </div>
                
                {/* Пагинация */}
                {totalPages > 1 && (
                  <div className="col-lg-12">
                    <ul className="pagination" style={{ marginBottom: "20px", justifyContent: "center" }}>
                      <li
                        className={"page-item " + (page === 1 ? "disabled" : "")}
                        onClick={(e) => {
                          e.preventDefault();
                          if (page > 1) handlePageChange(page - 1);
                        }}
                        style={{ cursor: page === 1 ? 'not-allowed' : 'pointer' }}
                      >
                        <a className="page-link" href="#!" aria-label="Previous">
                          <span aria-hidden="true">«</span>
                        </a>
                      </li>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <li
                          key={pageNum}
                          className={"page-item " + (page === pageNum ? "active" : "")}
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(pageNum);
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <a className="page-link" href="#!">
                            {pageNum}
                          </a>
                        </li>
                      ))}
                      <li
                        className={"page-item " + (page === totalPages ? "disabled" : "")}
                        onClick={(e) => {
                          e.preventDefault();
                          if (page < totalPages) handlePageChange(page + 1);
                        }}
                        style={{ cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
                      >
                        <a className="page-link" href="#!" aria-label="Next">
                          <span aria-hidden="true">»</span>
                        </a>
                      </li>
                    </ul>
                    <p style={{ textAlign: 'center', color: '#666', fontSize: '14px', marginTop: '-10px' }}>
                      Страница {page} из {totalPages} (Показано {paginatedProducts.length} из {products.length} книг)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </>
    );
}

export default Shop
