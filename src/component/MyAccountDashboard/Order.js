// import React from "react";
// import { Link } from "react-router-dom";
// const Order = () => {
//   return (
//     <>
//       <div className="myaccount-content">
//         <h4 className="title">Orders </h4>
//         <div className="table_page table-responsive">
//           <table>
//             <thead>
//              <tr>
//                     <th scope="col">Order</th>
//                     <th scope="col">Product Details</th>
//                     <th scope="col">Status</th>
//                     <th scope="col">Price</th>
//                   </tr>
//             </thead>
//             <tbody>
//               <tr>
//                 <td>1</td>
//                 <td>MEN</td>
//                 <td>Fotih Duman</td>
//                 <td>$25.00</td>
//                 <td>
//                   <span className="badge badge-info">Completed</span>
//                 </td>
//                 {/* <td><Link to="/order-success" className="view">view</Link></td> */}
//               </tr>
//               <tr>
//                 <td>2</td>
//                 <td>SIR</td>
//                 <td>Fotih Duman</td>
//                 <td>$17.00</td>
//                 <td>
//                   {" "}
//                   <span className="badge badge-warning">Processing</span>
//                 </td>
//                 {/* <td><Link to="/order-tracking" className="view">view</Link></td> */}
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Order;



import React from 'react'
import { Link } from 'react-router-dom'
const Order = () => {
  return (
    <>
      <div className="row">
        <div className="col-lg-12 col-md-12 col-sm-12 col-12">
          <div className="vendor_order_boxed">
            <h4>All Order</h4>
            <div className="table-responsive">
              <table className="table pending_table">
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Order</th>
                    <th scope="col">Book Details</th>
                    <th scope="col">Status</th>
                    <th scope="col">Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>MEN</td>
                    <td>
                      <span className="badge badge-info">Shipped</span>
                    </td>
                    <td>$50</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>SIR</td>
                    <td>
                      <span className="badge badge-warning">Pending</span>
                    </td>
                    <td>$50</td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>ASO</td>
                    <td>
                      <span className="badge badge-success">Confrimed</span>
                    </td>
                    <td>$58</td>
                  </tr>
                  <tr>
                    <td>4</td>
                    <td>PIR</td>
                    <td>
                      <span className="badge badge-danger">Canceled</span>
                    </td>
                    <td>$50</td>
                  </tr>
                  <tr>
                    <td>5</td>
                    <td>AMO</td>
                    <td>
                      <span className="badge badge-info">Shipped</span>
                    </td>
                    <td>$50</td>
                  </tr>
                  <tr>
                    <td>6</td>
                    <td>LOL</td>
                    <td>
                      <span className="badge badge-info">Shipped</span>
                    </td>
                    <td>$50</td>
                  </tr>
                  <tr>
                    <td>7</td>
                    <td>DAM</td>
                    <td>
                      <span className="badge badge-info">Shipped</span>
                    </td>
                    <td>$50</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="col-lg-12">
              <ul className="pagination">
                <li className="page-item">
                  <a href="#!" className="page-link">
                    <span aria-hidden="true">«</span>
                  </a>
                </li>
                <li className="page-item active">
                  <a href="#!" className="page-link">
                    1
                  </a>
                </li>
                <li className="page-item">
                  <a href="#!" className="page-link">
                    2
                  </a>
                </li>
                <li className="page-item">
                  <a href="#!" className="page-link">
                    3
                  </a>
                </li>
                <li className="page-item">
                  <a href="#!" className="page-link">
                    <span aria-hidden="true">»</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Order;
