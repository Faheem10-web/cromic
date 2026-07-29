import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Minus, Plus, Trash2, Lock, ShieldCheck, Truck, ArrowRight, CheckCircle2 } from "lucide-react";
import "./Cart.css";

function Cart() {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem("cart");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.error("Failed to parse cart items:", err);
    }
    return [];
  });
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Sync with storage events
  useEffect(() => {
    const handleSync = () => {
      try {
        const stored = localStorage.getItem("cart");
        if (stored) {
          setCartItems(JSON.parse(stored));
        } else {
          setCartItems([]);
        }
      } catch (err) {}
    };
    window.addEventListener("cart-updated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("cart-updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // Update cart in localStorage and dispatch event
  const saveCart = (items) => {
    setCartItems(items);
    try {
      localStorage.setItem("cart", JSON.stringify(items));
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      console.error("Failed to save cart items:", err);
    }
  };

  const updateQuantity = (index, newQty) => {
    if (newQty < 1) return;
    const updated = [...cartItems];
    updated[index].quantity = newQty;
    saveCart(updated);
  };

  const removeItem = (index) => {
    const updated = cartItems.filter((_, i) => i !== index);
    saveCart(updated);
  };

  // Helper to parse price string to number
  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    return parseFloat(priceStr.replace(/[^\d.]/g, "")) || 0;
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const val = parsePrice(item.price);
    return sum + val * (item.quantity || 1);
  }, 0);

  const shipping = subtotal > 150 ? 0 : 15;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleCheckout = () => {
    setIsCheckingOut(true);
    // Simulate premium checkout redirect or success screen
    setTimeout(() => {
      setIsCheckingOut(false);
      setCheckoutSuccess(true);
      // Clear cart
      saveCart([]);
    }, 1500);
  };

  if (checkoutSuccess) {
    return (
      <div className="cart-page-container">
        <div className="cart-wrapper">
          <div className="cart-empty-state">
            <CheckCircle2 size={64} className="cart-empty-icon" style={{ color: "#4BB543" }} />
            <h1 className="cart-empty-title">ORDER PLACED SUCCESSFULLY</h1>
            <p className="cart-empty-desc">
              Thank you for shopping with CROMIC. We've received your order and are preparing your luxury frames for delivery. A confirmation email has been sent.
            </p>
            <Link to="/shop" className="cart-return-btn">
              CONTINUE SHOPPING
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      <div className="cart-wrapper">
        <h1 className="cart-title">YOUR SHOPPING BAG</h1>
        <p className="cart-subtitle">
          {cartItems.length} {cartItems.length === 1 ? "ITEM" : "ITEMS"} IN BAG
        </p>

        {cartItems.length === 0 ? (
          <div className="cart-empty-state">
            <ShoppingBag size={48} className="cart-empty-icon" />
            <h2 className="cart-empty-title">YOUR BAG IS EMPTY</h2>
            <p className="cart-empty-desc">
              Explore CROMIC sunglasses and optical frame collections to find your signature look.
            </p>
            <Link to="/shop" className="cart-return-btn">
              DISCOVER COLLECTIONS
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Items List */}
            <div className="cart-items-list">
              {cartItems.map((item, index) => (
                <div className="cart-item-card" key={`${item.id}-${item.color}-${index}`}>
                  <div className="cart-item-image-wrapper">
                    <img src={item.image} alt={item.name} />
                  </div>
                  
                  <div className="cart-item-details">
                    <Link to={`/product/${item.id}`} className="cart-item-name">
                      {item.name}
                    </Link>
                    <span className="cart-item-meta">COLOR: {item.color}</span>
                    
                    <div className="cart-item-quantity-row">
                      <div className="cart-item-stepper">
                        <button 
                          type="button" 
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="cart-item-qty-val">{item.quantity}</span>
                        <button 
                          type="button" 
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeItem(index)}
                        className="cart-item-remove-btn"
                      >
                        REMOVE
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-price-col">
                    <span className="cart-item-price">
                      ${(parsePrice(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Panel */}
            <aside className="cart-summary-panel">
              <h3 className="summary-title">ORDER SUMMARY</h3>
              <div className="summary-rows">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Estimated Shipping</span>
                  <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="summary-row">
                  <span>Estimated Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="summary-row total-row">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button 
                type="button" 
                onClick={handleCheckout}
                className="checkout-btn"
                disabled={isCheckingOut}
              >
                {isCheckingOut ? (
                  "PROCESSING ORDER..."
                ) : (
                  <>
                    <span>SECURE CHECKOUT</span>
                    <Lock size={12} />
                  </>
                )}
              </button>

              <div className="trust-badge-list">
                <div className="trust-badge-item">
                  <ShieldCheck size={14} style={{ color: "#B58A3D" }} />
                  <span>Secure SSL Encrypted Checkout</span>
                </div>
                <div className="trust-badge-item">
                  <Truck size={14} style={{ color: "#B58A3D" }} />
                  <span>Free Shipping on Orders Over $150</span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
