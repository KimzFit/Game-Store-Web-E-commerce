import React from 'react';
import '../style/Cart.css'

const Cart = ({ isCartVisible, toggleCart, cartvalue }) => {
  return (
    <div className={`cart-panel ${isCartVisible ? 'visible' : ''}`}>
      <div className="cart-header">
        <h2>{cartvalue} game</h2>
        <button className="clear-btn" onClick={toggleCart}>Clear</button>
      </div>
      {/* ส่วนนี้สามารถใส่รายการสินค้าหรือเกมได้ */}
      <div className="cart-footer">
        <span>Total: $0.00</span>
        <button className="checkout-btn">Checkout →</button>
      </div>
    </div>
  );
};

export default Cart;
