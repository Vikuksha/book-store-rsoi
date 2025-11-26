import React from 'react'

const Filter = (props) => {
    const handleSortChange = (e) => {
        const sortBy = e.target.value;
        if (props.onFilterChange) {
            props.onFilterChange({ sortBy });
        }
    };

    const handleInStockChange = (e) => {
        const inStock = e.target.checked;
        if (props.onFilterChange) {
            props.onFilterChange({ inStock });
        }
    };

    const handleHasDiscountChange = (e) => {
        const hasDiscount = e.target.checked;
        if (props.onFilterChange) {
            props.onFilterChange({ hasDiscount });
        }
    };

    const handleAuthorChange = (author) => {
        const selectedAuthors = props.filterOptions?.selectedAuthors || [];
        const newSelectedAuthors = selectedAuthors.includes(author)
            ? selectedAuthors.filter(a => a !== author)
            : [...selectedAuthors, author];
        
        if (props.onFilterChange) {
            props.onFilterChange({ selectedAuthors: newSelectedAuthors });
        }
    };

    const handleYearChange = (year) => {
        const selectedYears = props.filterOptions?.selectedYears || [];
        const newSelectedYears = selectedYears.includes(year)
            ? selectedYears.filter(y => y !== year)
            : [...selectedYears, year];
        
        if (props.onFilterChange) {
            props.onFilterChange({ selectedYears: newSelectedYears });
        }
    };

    const handleGenreChange = (genre) => {
        const selectedGenres = props.filterOptions?.selectedGenres || [];
        const newSelectedGenres = selectedGenres.includes(genre)
            ? selectedGenres.filter(g => g !== genre)
            : [...selectedGenres, genre];
        
        if (props.onFilterChange) {
            props.onFilterChange({ selectedGenres: newSelectedGenres });
        }
    };

    return (
        <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '25px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
            marginBottom: '30px',
            border: '1px solid #e9ecef'
        }}>
            <h4 style={{
                marginBottom: '20px',
                fontSize: '18px',
                fontWeight: '600',
                color: '#2c3e50',
                borderBottom: '2px solid #007bff',
                paddingBottom: '10px'
            }}>
                Фильтры и сортировка
            </h4>
            
            <div style={{ marginBottom: '25px' }}>
                <label style={{
                    display: 'block',
                    marginBottom: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#495057',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    Сортировка
                </label>
                <select 
                    name="sort" 
                    value={props.filterOptions?.sortBy || 'newest'}
                    onChange={handleSortChange}
                    style={{
                        width: '100%',
                        padding: '12px 15px',
                        fontSize: '15px',
                        border: '2px solid #dee2e6',
                        borderRadius: '8px',
                        backgroundColor: '#ffffff',
                        color: '#495057',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        outline: 'none',
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 15px center',
                        paddingRight: '40px'
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = '#007bff';
                        e.target.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.1)';
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = '#dee2e6';
                        e.target.style.boxShadow = 'none';
                    }}
                    onMouseEnter={(e) => {
                        if (document.activeElement !== e.target) {
                            e.target.style.borderColor = '#adb5bd';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (document.activeElement !== e.target) {
                            e.target.style.borderColor = '#dee2e6';
                        }
                    }}
                >
                    <option value="newest">🆕 Новинки</option>
                    <option value="popularity">⭐ По популярности</option>
                    <option value="rating_desc">⭐ По рейтингу</option>
                    <option value="price_asc">💰 Цена: по возрастанию</option>
                    <option value="price_desc">💰 Цена: по убыванию</option>
                    <option value="title_asc">🔤 По названию (А-Я)</option>
                </select>
            </div>

            <div style={{
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
            }}>
                <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    userSelect: 'none',
                    fontSize: '15px',
                    color: '#495057',
                    fontWeight: '500'
                }}>
                    <div style={{ position: 'relative', marginRight: '12px' }}>
                        <input 
                            type="checkbox" 
                            checked={props.filterOptions?.inStock || false}
                            onChange={handleInStockChange}
                            style={{
                                width: '20px',
                                height: '20px',
                                cursor: 'pointer',
                                margin: 0,
                                opacity: 0,
                                position: 'absolute',
                                zIndex: 1
                            }}
                        />
                        <div style={{
                            width: '20px',
                            height: '20px',
                            border: '2px solid #007bff',
                            borderRadius: '4px',
                            backgroundColor: props.filterOptions?.inStock ? '#007bff' : '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            position: 'relative'
                        }}>
                            {props.filterOptions?.inStock && (
                                <svg 
                                    width="14" 
                                    height="14" 
                                    viewBox="0 0 14 14" 
                                    fill="none"
                                    style={{ color: '#ffffff' }}
                                >
                                    <path 
                                        d="M11.5 3.5L5.5 9.5L2.5 6.5" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            )}
                        </div>
                    </div>
                    <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span style={{ fontSize: '18px' }}>✓</span>
                        <span>Только в наличии</span>
                    </span>
                </label>
            </div>

            {/* Фильтр по скидкам */}
            <div style={{
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef',
                marginTop: '15px'
            }}>
                <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    userSelect: 'none',
                    fontSize: '15px',
                    color: '#495057',
                    fontWeight: '500'
                }}>
                    <div style={{ position: 'relative', marginRight: '12px' }}>
                        <input 
                            type="checkbox" 
                            checked={props.filterOptions?.hasDiscount || false}
                            onChange={handleHasDiscountChange}
                            style={{
                                width: '20px',
                                height: '20px',
                                cursor: 'pointer',
                                margin: 0,
                                opacity: 0,
                                position: 'absolute',
                                zIndex: 1
                            }}
                        />
                        <div style={{
                            width: '20px',
                            height: '20px',
                            border: '2px solid #007bff',
                            borderRadius: '4px',
                            backgroundColor: props.filterOptions?.hasDiscount ? '#007bff' : '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            position: 'relative'
                        }}>
                            {props.filterOptions?.hasDiscount && (
                                <svg 
                                    width="14" 
                                    height="14" 
                                    viewBox="0 0 14 14" 
                                    fill="none"
                                    style={{ color: '#ffffff' }}
                                >
                                    <path 
                                        d="M11.5 3.5L5.5 9.5L2.5 6.5" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            )}
                        </div>
                    </div>
                    <span>Со скидкой</span>
                </label>
            </div>

            {/* Фильтр по авторам */}
            {props.uniqueAuthors && props.uniqueAuthors.length > 0 && (
                <div style={{ marginTop: '25px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '12px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#495057',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        Авторы
                    </label>
                    <div style={{
                        maxHeight: '200px',
                        overflowY: 'auto',
                        border: '1px solid #dee2e6',
                        borderRadius: '8px',
                        padding: '10px',
                        backgroundColor: '#ffffff'
                    }}>
                        {props.uniqueAuthors.map((author, index) => {
                            const isSelected = props.filterOptions?.selectedAuthors?.includes(author) || false;
                            return (
                                <label
                                    key={index}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        fontSize: '14px',
                                        color: '#495057',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        marginBottom: '4px',
                                        transition: 'background-color 0.2s',
                                        backgroundColor: isSelected ? '#e7f3ff' : 'transparent'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSelected) e.currentTarget.style.backgroundColor = '#f8f9fa';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleAuthorChange(author)}
                                        style={{
                                            width: '18px',
                                            height: '18px',
                                            cursor: 'pointer',
                                            marginRight: '10px'
                                        }}
                                    />
                                    <span>{author}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Фильтр по годам */}
            {props.uniqueYears && props.uniqueYears.length > 0 && (
                <div style={{ marginTop: '25px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '12px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#495057',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        Год издания
                    </label>
                    <div style={{
                        maxHeight: '150px',
                        overflowY: 'auto',
                        border: '1px solid #dee2e6',
                        borderRadius: '8px',
                        padding: '10px',
                        backgroundColor: '#ffffff'
                    }}>
                        {props.uniqueYears.map((year, index) => {
                            const isSelected = props.filterOptions?.selectedYears?.includes(year) || false;
                            return (
                                <label
                                    key={index}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        fontSize: '14px',
                                        color: '#495057',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        marginBottom: '4px',
                                        transition: 'background-color 0.2s',
                                        backgroundColor: isSelected ? '#e7f3ff' : 'transparent'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSelected) e.currentTarget.style.backgroundColor = '#f8f9fa';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleYearChange(year)}
                                        style={{
                                            width: '18px',
                                            height: '18px',
                                            cursor: 'pointer',
                                            marginRight: '10px'
                                        }}
                                    />
                                    <span>{year}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Фильтр по жанрам */}
            {props.uniqueGenres && props.uniqueGenres.length > 0 && (
                <div style={{ marginTop: '25px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '12px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#495057',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        Жанры
                    </label>
                    <div style={{
                        maxHeight: '200px',
                        overflowY: 'auto',
                        border: '1px solid #dee2e6',
                        borderRadius: '8px',
                        padding: '10px',
                        backgroundColor: '#ffffff'
                    }}>
                        {props.uniqueGenres.map((genre, index) => {
                            const isSelected = props.filterOptions?.selectedGenres?.includes(genre) || false;
                            return (
                                <label
                                    key={index}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        fontSize: '14px',
                                        color: '#495057',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        marginBottom: '4px',
                                        transition: 'background-color 0.2s',
                                        backgroundColor: isSelected ? '#e7f3ff' : 'transparent'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSelected) e.currentTarget.style.backgroundColor = '#f8f9fa';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleGenreChange(genre)}
                                        style={{
                                            width: '18px',
                                            height: '18px',
                                            cursor: 'pointer',
                                            marginRight: '10px'
                                        }}
                                    />
                                    <span>{genre}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Filter
