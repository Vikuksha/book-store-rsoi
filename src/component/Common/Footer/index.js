import React, { useEffect } from "react";
import logo from "../../../assets/img/bh-l.png"; // <- BU SIZNING BOOKHEAVEN LOGO RASMI
import payment from "../../../assets/img/common/payment.png";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Swal from "sweetalert2";

const FooterData = [
  {
    title: "INFORMATION",
    links: [
      { linkTitle: "Home", link: "/" },
      { linkTitle: "Shop", link: "/shop" },
      // { linkTitle: "Cart", link: "/cart" },
      { linkTitle: "About us", link: "/about" },
      // { linkTitle: "Help", link: "/help" },
    ],
  },
  {
    title: "SHOP",
    links: [
      { linkTitle: "Cart", link: "/cart" },
      // { linkTitle: "Wishlist", link: "/wishlist" },
      { linkTitle: "Help", link: "/help" },
    ],
  },
];

const Footer = () => {
  return null; // Footer hidden globally by request
};

export default Footer;
