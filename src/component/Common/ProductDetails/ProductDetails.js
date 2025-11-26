import React, { useState, useMemo } from 'react'
import ProductInfo from './ProductInfo'
import ProductCard from '../Product/ProductCard'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from "react-redux";
import { useParams } from 'react-router-dom';
import { RatingStar } from "rating-star";
import Swal from 'sweetalert2';

const ProductDetailsOne = () => {
    let dispatch = useDispatch();

    let { id } = useParams();
    let product = useSelector((state) => state.products.single);
    const allProducts = useSelector((state) => state.products.products);
    
    const [count, setCount] = useState(1)
    const [img, setImg] = useState('')
    
    // Получаем книги с таким же жанром (исключая текущую книгу)
    const relatedBooks = useMemo(() => {
        if (!product || !product.genre || !allProducts || allProducts.length === 0) {
            return [];
        }
        
        return allProducts
            .filter(item => 
                item.genre && 
                item.genre.trim() === product.genre.trim() && 
                item.id !== product.id
            )
            .slice(0, 4); // Показываем максимум 4 книги
    }, [product, allProducts]);
    
    // Загружаем продукт при изменении id
    React.useEffect(() => {
        dispatch({ type: "products/getProductById", payload: { id } });
    }, [id, dispatch]);
    
    // Обновляем изображение при изменении продукта
    React.useEffect(() => {
        if (product && product.img) {
            setImg(product.img);
        } else {
            setImg('');
        }
    }, [product]);

    // Add to cart
    const addToCart = async (id) => {
        dispatch({ type: "products/addToCart", payload: { id } })
    }

    // Add to Favorite
    const addToFav = async (id) => {
        dispatch({ type: "products/addToFav", payload: { id } })
    }

    // Add to Compare
    // const addToComp = async (id) => {
    //     dispatch({ type: "products/addToComp", payload: { id } })
    // }

    const colorSwatch = (i) => {
        if (product && product.color && product.color.length > 0) {
            let data = product.color.find(item => item.color === i)
            if (data && data.img) {
                setImg(data.img)
            }
        }
    }

    const incNum = () => {
        setCount(count + 1)
    }
    const decNum = () => {
        if (count > 1) {
            setCount(count - 1)
        } else {
            Swal.fire('Sorry!', "Minimun Quantity Reached",'warning')
            setCount(1)
        }
    }
    return (
        <>{product && product.id
            ?
            <section id="product_single_one" className="ptb-100">
                <div className="container">
                    <div className="row area_boxed">
                        <div className="col-lg-4">
                            <div className="product_single_one_img">
                                {img ? <img src={img} alt={product.title || "Product"} /> : <div>Loading image...</div>}
                            </div>
                        </div>
                        <div className="col-lg-8">
                            <div className="product_details_right_one">
                                <div className="modal_product_content_one">
                                    <h3>{product.title || 'Untitled'}</h3>
                                    {product.genre && (
                                        <div style={{ marginBottom: '10px' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '5px 12px',
                                                backgroundColor: '#007bff',
                                                color: '#ffffff',
                                                borderRadius: '15px',
                                                fontSize: '14px',
                                                fontWeight: '500'
                                            }}>
                                                {product.genre}
                                            </span>
                                        </div>
                                    )}
                                    <div className="reviews_rating">
                                        <RatingStar maxScore={5} rating={product.rating?.rate || 0} id="rating-star-common" />
                                        {/* <span>({product.rating?.count || 0} Customer Reviews)</span> */}
                                    </div>
                                    <h4>${typeof product.price === 'number' ? product.price.toFixed(2) : (product.price || '0.00')} {product.price && <del>${typeof product.price === 'number' ? (product.price + 17).toFixed(2) : (parseInt(product.price) + 17)}.00</del>}</h4>
                                    <p>{product.description || 'No description available'}</p>
                                    <div className="customs_selects">
                                        {/* <select name="product" className="customs_sel_box">
                                            <option value="volvo">Size</option>
                                            <option value="xl">XL</option>
                                            <option value="small">S</option>
                                            <option value="medium">M</option>
                                            <option value="learz">L</option>
                                        </select> */}
                                    </div>
                                    <div className="variable-single-item">
                                        {/* <span>Color</span> */}
                                        {/* <div className="product-variable-color">
                                            <label htmlFor="modal-product-color-red1">
                                                <input name="modal-product-color" id="modal-product-color-red1"
                                                    className="color-select" type="radio" onChange={() => { colorSwatch('red') }} defaultChecked/>
                                                <span className="product-color-red"></span>
                                            </label>
                                            <label htmlFor="modal-product-color-green3">
                                                <input name="modal-product-color" id="modal-product-color-green3"
                                                    className="color-select" type="radio" onChange={() => { colorSwatch('green') }} />
                                                <span className="product-color-green"></span>
                                            </label>
                                            <label htmlFor="modal-product-color-blue5">
                                                <input name="modal-product-color" id="modal-product-color-blue5"
                                                    className="color-select" type="radio" onChange={() => { colorSwatch('blue') }} />
                                                <span className="product-color-blue"></span>
                                            </label>
                                        </div> */}
                                    </div>
                                    <form id="product_count_form_two">
                                        <div className="product_count_one">
                                            <div className="plus-minus-input">
                                                <div className="input-group-button">
                                                    <button type="button" className="button" onClick={decNum}>
                                                        <i className="fa fa-minus"></i>
                                                    </button>
                                                </div>
                                                <input className="form-control" type="number" value={count} readOnly />
                                                <div className="input-group-button">
                                                    <button type="button" className="button" onClick={incNum}>
                                                        <i className="fa fa-plus"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                    <div className="links_Product_areas">
                                        <ul>
                                            <li>
                                                <a href="#!" className="action wishlist" title="Wishlist" onClick={() => addToFav(product.id)}><i
                                                    className="fa fa-heart"></i>Add To Wishlist</a>
                                            </li>
                                            {/* <li>
                                                <a href="#!" className="action compare" onClick={() => addToComp(product.id)} title="Compare"><i
                                                    className="fa fa-exchange"></i>Add To Compare</a>
                                            </li> */}
                                        </ul>
                                        <a href="#!" className="theme-btn-one btn-black-overlay btn_sm" onClick={() => addToCart(product.id)}>Add To Cart</a>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                    <ProductInfo />
                    
                    {/* Блок с книгами того же жанра */}
                    {relatedBooks.length > 0 && (
                        <div className="row" style={{ marginTop: '60px', paddingTop: '40px', borderTop: '2px solid #e9ecef' }}>
                            <div className="col-12">
                                <h3 style={{
                                    fontSize: '24px',
                                    fontWeight: '600',
                                    marginBottom: '30px',
                                    textAlign: 'center',
                                    color: '#2c3e50'
                                }}>
                                    С этим товаром покупают
                                </h3>
                                <div className="row">
                                    {relatedBooks.map((book, index) => (
                                        <div className="col-lg-3 col-md-4 col-sm-6 col-12" key={book.id || index} style={{ marginBottom: '30px' }}>
                                            <ProductCard data={book} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
            :
            <div className="container ptb-100">
                <div className="row">
                    <div className="col-lg-6 offset-lg-3 col-md-6 offset-md-3 col-sm-12 col-12">
                        <div className="empaty_cart_area">
                            <h2>PRODUCT NOT FOUND</h2>
                            <h3>Sorry Mate... No Item Found according to Your query!</h3>
                            <Link to="/shop" className="btn btn-black-overlay btn_sm">Continue Shopping</Link>
                        </div>
                    </div>
                </div>
            </div>
        }
        </>
    )
}

export default ProductDetailsOne