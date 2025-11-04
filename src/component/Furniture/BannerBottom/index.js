 import React from 'react'
 import { Link } from 'react-router-dom'
//  import img
import img1 from '../../../assets/img/furniture/banner/LB1.jpg'
import img2 from '../../../assets/img/furniture/banner/lB2.avif'
import img3 from '../../../assets/img/furniture/banner/lB1.avif'
import img4 from '../../../assets/img/furniture/banner/lB3.avif'

 
 const BannerBottom = () => {
     return (
       <>
         <section id="furniture_banner_bottom" className="pt-100">
           <div className="container">  
             <div className="row">
               <div className="col-lg-6 col-md-12 col-sm-12 col-12">
                 <div className="furniture_bottom_wrapper">
                   <Link to="/shop" className="hover_effect_furniture">
                     <img src={img1} alt="img" />
                   </Link>
                   <div className="furniture_bottom_content furniture-content-lg">
                     {/* <h5>Novel Book</h5> */}
                     <h2>
                       Novel Book <br /> Bookstore
                     </h2>
                     <Link to="/shop">Shop Now</Link>
                   </div>
                 </div>
               </div>
               <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                 <div className="furniture_bottom_wrapper mb-30">
                   <Link to="/shop" className="hover_effect_furniture">
                     <img src={img2} alt="img" />
                   </Link>
                   <div className="furniture_bottom_content furniture-content-md">
                     {/* <h5>Novel Book</h5> */}
                     <h2>
                       Novel Book <br /> BookStore
                     </h2>
                     <Link to="/shop">Shop Now</Link>
                   </div>
                 </div>
                 <div className="furniture_bottom_wrapper">
                   <Link to="/shop" className="hover_effect_furniture">
                     <img src={img3} alt="img" />
                   </Link>
                   <div className="furniture_bottom_content furniture-content-md">
                     {/* <h5>Novel Book</h5> */}
                     <h2>
                       Novel Book
                       <br /> BookStore
                     </h2>
                     <Link to="/shop">Shop Now</Link>
                   </div>
                 </div>
               </div>
               <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                 <div className="furniture_bottom_wrapper">
                   <Link to="/shop" className="hover_effect_furniture">
                     <img src={img4} alt="img" />
                   </Link>
                   <div className="furniture_bottom_content furniture-content-md">
                     {/* <h5>Novel Book</h5> */}
                     <h2>
                       Novel Book
                       <br /> BookStore
                     </h2>
                     <Link to="/shop">Shop Now</Link>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </section>
       </>
     );
 }
 
 export default BannerBottom
 