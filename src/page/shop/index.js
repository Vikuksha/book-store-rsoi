import React from 'react'
import Header from '../../component/Common/Header'
import Banner from '../../component/Common/Banner'
import Shop from '../../component/Shop/Shop'
// import Map from '../../component/ContactOne/Map'
// import InstgramSlider from '../../component/Common/Instagram'
import Footer from '../../component/Common/Footer'

const ShopGrid = () => {
    return (
        <>
            <Header />
            <Banner title="Shop" />
            <Shop />
            {/* Map removed by request */}
            {/* <InstgramSlider /> */}
            <Footer />
        </>
    )
}

export default ShopGrid