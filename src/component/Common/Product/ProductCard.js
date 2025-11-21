import React, { useState } from 'react'
import { AiOutlineHeart } from 'react-icons/ai';
import { AiOutlineExpand } from 'react-icons/ai';
import { FaExchangeAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { RatingStar } from "rating-star";
import MyVerticallyCenteredModal from '../../Common/Modal';

const ProductCard = (props) => {
    let dispatch = useDispatch();
    // Add to cart
    const addToCart = async (id) => {
        dispatch({ type: "products/addToCart", payload: { id } })
    }
    // Add to Favorite
    // const addToFav = async (id) => {
    //     dispatch({ type: "products/addToFav", payload: { id } })
    // }
    // Add to Compare
    // const addToComp = async (id) => {
    //     dispatch({ type: "products/addToComp", payload: { id } })
    // }
    const [modalShow, setModalShow] = useState(false);
    return (
        <>
            <div className="product_wrappers_one">
                <div className="thumb">
                    <Link to={`/product-details-one/${props.data.id}`} className="image">
                        <img src={props.data.img} alt="Product" />
                        <img className="hover-image" src={props.data.hover_img}
                            alt="Product" />
                    </Link>
                    <span className="badges">
                        {props.data.hasDiscount && (
                            <span className="sale" style={{ backgroundColor: '#e74c3c', color: '#fff', padding: '5px 10px', borderRadius: '3px' }}>
                                -{props.data.discountPercent || 25}%
                            </span>
                        )}
                        {props.data.labels && (
                            <span className="new">{props.data.labels}</span>
                        )}
                    </span>
                    {/* <div className="actions">
                        <a href="#!" className="action wishlist" title="Wishlist" onClick={() => addToFav(props.data.id)}><AiOutlineHeart /></a>
                        <a href="#!" className="action quickview" title="Quick view" onClick={() => setModalShow(true)}><AiOutlineExpand /></a>
                        <a href="#!" className="action compare" title="Compare" onClick={() => addToComp(props.data.id)}><FaExchangeAlt /></a>
                    </div> */}
                    <button type="button" className="add-to-cart offcanvas-toggle" onClick={() => addToCart(props.data.id)}>Add to cart</button>
                </div>
                <div className="content">
                    <h5 className="title">
                        <Link to={`/product-details-one/${props.data.id}`}>{props.data.title}</Link>
                    </h5>
                    <span className="price">
                        {props.data.hasDiscount ? (
                            <>
                                <span className="old" style={{ textDecoration: 'line-through', color: '#999', marginRight: '10px' }}>
                                    ${(props.data.originalPrice || props.data.price).toFixed(2)}
                                </span>
                                <span className="new" style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                                    ${(props.data.discountedPrice || props.data.price).toFixed(2)}
                                </span>
                                <span style={{ marginLeft: '8px', color: '#e74c3c', fontSize: '12px', fontWeight: 'bold' }}>
                                    -{props.data.discountPercent || 25}%
                                </span>
                            </>
                        ) : (
                            <span className="new">${typeof props.data.price === 'number' ? props.data.price.toFixed(2) : props.data.price}</span>
                        )}
                    </span>
                    <div className="rating_wrap" style={{ marginTop: '10px' }}>
                        <div className="rating">
                            <RatingStar 
                                maxScore={5} 
                                rating={props.data.rating?.rate || 0} 
                                id={`rating-star-${props.data.id}`} 
                            />
                        </div>
                        {(props.data.rating?.count || 0) > 0 && (
                            <span className="rating_num" style={{ marginLeft: '5px', fontSize: '12px', color: '#666' }}>
                                ({props.data.rating.count})
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <MyVerticallyCenteredModal data={props.data} show={modalShow} onHide={() => setModalShow(false)} />
        </>
    )
}

export default ProductCard