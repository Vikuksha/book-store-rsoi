import React from "react";
import { Link } from "react-router-dom";

const NaveItems = (props) => {
  return (
    <li>
      <Link to={props.item.href}>{props.item.name}</Link>
    </li>
  );
};

export default NaveItems;
