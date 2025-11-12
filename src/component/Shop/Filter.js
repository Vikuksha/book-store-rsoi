import React from 'react'

const Filter = (props) => {
    const handleSortChange = (e) => {
        const sortBy = e.target.value;
        if (props.onFilterChange) {
            props.onFilterChange({ sortBy });
        }
        props.filterEvent(1);
    };

    const handleInStockChange = (e) => {
        const inStock = e.target.checked;
        if (props.onFilterChange) {
            props.onFilterChange({ inStock });
        }
        props.filterEvent(1);
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
        </div>
    )
}

export default Filter
