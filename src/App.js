import React from 'react';
import { BrowserRouter as Router, Switch, Route, BrowserRouter } from 'react-router-dom';
import loadable from './component/Common/loader/loadable';
import Loading from './component/Common/loader';
import pMinDelay from 'p-min-delay';
import BookLoader from './components/BookLoader';


const ShopGrid = loadable(() => pMinDelay(import('./page/shop'), 250), { fallback: <Loading /> });
// const ShopTwo = loadable(() => pMinDelay(import('./page/shop/shop-two'), 250), { fallback: <Loading /> });
// const ShopList = loadable(() => pMinDelay(import('./page/shop/shop-list'), 250), { fallback: <Loading /> });
const ProductDetails = loadable(() => pMinDelay(import('./page/product/index'), 250), { fallback: <Loading /> });
const Cart = loadable(() => pMinDelay(import('./page/cart/index'), 250), { fallback: <Loading /> });
// const CartTwo = loadable(() => pMinDelay(import('./page/cart/cart-two'), 250), { fallback: <Loading /> });
// const CartThree = loadable(() => pMinDelay(import('./page/cart/cart-three'), 250), { fallback: <Loading /> });
// const EmptyCarts = loadable(() => pMinDelay(import('./page/cart/empty-cart'), 250), { fallback: <Loading /> });
// const About = loadable(() => pMinDelay(import('./page/about'), 250), { fallback: <Loading /> });
const OrderComplete = loadable(() => pMinDelay(import('./page/order/order-complete'), 250), { fallback: <Loading /> });
// const OrderTracking = loadable(() => pMinDelay(import('./page/order/order-tracking'), 250), { fallback: <Loading /> });
// const ProductHover = loadable(() => pMinDelay(import('./page/product/product-hover'), 250), { fallback: <Loading /> });
// const OrderSuccesses = loadable(() => pMinDelay(import('./page/order/order-success'), 250), { fallback: <Loading /> });
// const BlogGridThrees = loadable(() => pMinDelay(import('./page/blog/blog-grid-two'), 250), { fallback: <Loading /> });
// const BlogGridTwos = loadable(() => pMinDelay(import('./page/blog/'), 250), { fallback: <Loading /> });
// const BlogListView = loadable(() => pMinDelay(import('./page/blog/blog-list'), 250), { fallback: <Loading /> });
// const Vendor = loadable(() => pMinDelay(import('./page/vendor/'), 250), { fallback: <Loading /> });
// const AllProducts = loadable(() => pMinDelay(import('./page/vendor/all-product'), 250), { fallback: <Loading /> });
// const AllOrders = loadable(() => pMinDelay(import('./page/vendor/all-order'), 250), { fallback: <Loading /> });
// const VendorProfile = loadable(() => pMinDelay(import('./page/vendor/vendor-profile'), 250), { fallback: <Loading /> });
// const AddProducts = loadable(() => pMinDelay(import('./page/vendor/add-products'), 250), { fallback: <Loading /> });
// const VendorSetting = loadable(() => pMinDelay(import('./page/vendor/vendor-setting'), 250), { fallback: <Loading /> });
const MyAccounts = loadable(() => pMinDelay(import('./page/my-account'), 250), { fallback: <Loading /> });
const CustomerOrder = loadable(() => pMinDelay(import('./page/my-account/customer-order'), 250), { fallback: <Loading /> });
const CustomerDownloads = loadable(() => pMinDelay(import('./page/my-account/customer-downloads'), 250), { fallback: <Loading /> });
const CustomerAddress = loadable(() => pMinDelay(import('./page/my-account/customer-address'), 250), { fallback: <Loading /> });
const CustomerAccountDetails = loadable(() => pMinDelay(import('./page/my-account/customer-account-details'), 250), { fallback: <Loading /> });
const AccountEdit = loadable(() => pMinDelay(import('./page/vendor/account-edit'), 250), { fallback: <Loading /> });
const Login = loadable(() => pMinDelay(import('./page/login'), 250), { fallback: <Loading /> });
const Register = loadable(() => pMinDelay(import('./page/register'), 250), { fallback: <Loading /> });
const AdminPanel = loadable(() => pMinDelay(import('./page/admin'), 250), { fallback: <Loading /> });
const Error = loadable(() => pMinDelay(import('./page/error'), 250), { fallback: <Loading /> });
// const PrivacyPolicy = loadable(() => pMinDelay(import('./page/privacy-policy'), 250), { fallback: <Loading /> });
const Faqs = loadable(() => pMinDelay(import('./page/faqs'), 250), { fallback: <Loading /> });
// const ContactOne = loadable(() => pMinDelay(import('./page/contact'), 250), { fallback: <Loading /> });
const ScrollToTop = loadable(() => pMinDelay(import('./component/Common/ScrollToTop'), 250), { fallback: <Loading /> });
// const Fashion = loadable(() => pMinDelay(import('./page/'), 250), { fallback: <Loading /> });
const Furniture = loadable(() => pMinDelay(import('./page/furniture'), 250), { fallback: <Loading /> });


const App = () => {
  return (
    <>
      {/* <BrowserRouter> */}
        <Router>
          <BookLoader />
          <ScrollToTop />
          <Switch>
            <Route path='/' exact component={Furniture} />
            {/* <Route path='/fashion' exact component={Fashion} /> */}
            <Route path='/shop' exact component={ShopGrid} />
            {/* <Route path='/shopTwo' exact component={ShopTwo} /> */}
            {/* <Route path='/shoplist' exact component={ShopList} /> */}
            <Route path='/product-details-one/:id' exact component={ProductDetails} />
            <Route path='/cart' exact component={Cart} />
            {/* <Route path='/cartTwo' exact component={CartTwo} /> */}
            {/* <Route path='/cartThree' exact component={CartThree} /> */}
            {/* <Route path='/empty-cart' exact component={EmptyCarts} /> */}
            <Route path='/order-complete' exact component={OrderComplete} />
            {/* <Route path='/order-tracking' exact component={OrderTracking} /> */}
            {/* <Route path='/about' exact component={About} /> */}
            {/* <Route path='/product-hover' exact component={ProductHover} />
            <Route path='/order-success' exact component={OrderSuccesses} />
            <Route path='/blog-grid-three' exact component={BlogGridThrees} />
            <Route path='/blog-grid-two' exact component={BlogGridTwos} />
            <Route path='/blog-list-view' exact component={BlogListView} /> */}
            {/* <Route path='/vendor-dashboard' exact component={Vendor} />
            <Route path='/vendor/all-product' exact component={AllProducts} />
            <Route path='/vendor/all-order' exact component={AllOrders} />
            <Route path='/vendor/vendor-profile' exact component={VendorProfile} />
            <Route path='/vendor/add-products' exact component={AddProducts} />
            <Route path='/vendor/vendor-setting' exact component={VendorSetting} /> */}
            <Route path='/my-account' exact component={MyAccounts} />
            <Route path='/my-account/customer-order' exact component={CustomerOrder} />
            <Route path='/my-account/customer-download' exact component={CustomerDownloads} />
            <Route path='/my-account/customer-address' exact component={CustomerAddress} />
            <Route path='/my-account/customer-account-details' exact component={CustomerAccountDetails} />
            <Route path='/account-edit' exact component={AccountEdit} />
            <Route path='/login' exact component={Login} />
            <Route path='/register' exact component={Register} />
            <Route path='/admin' exact component={AdminPanel} />
            {/* <Route path='/privacy-policy' exact component={PrivacyPolicy} /> */}
            <Route path='/help' exact component={Faqs} />
            {/* <Route path='/contact-one' exact component={ContactOne} /> */}
            <Route exact component={Error} />
          </Switch>  
        </Router>
      {/* </BrowserRouter> */}

    </>
  );
}

export default App;