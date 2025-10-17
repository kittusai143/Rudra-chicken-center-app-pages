// App.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, Outlet, useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Image, Badge } from "react-bootstrap";
import { FaShoppingCart } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import Sidebar from "./components/Sidebar";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Stores from "./pages/Stores";
import Reviews from "./pages/Reviews";
import Products from "./pages/Products";
import MapView from "./pages/MapView";
import Drivers from "./pages/Drivers";
import Cart from "./pages/Cart";
import Login from "./components/Login";
import Register from "./components/Register";
import ResetPassword from "./components/ResetPassword";
import ForgotPassword from "./components/ForgotPassword";
import VerifyOtp from "./components/VerifyOtp";
import Settings from "./pages/Settings"; // adjust path if needed


function DashboardLayout({ onLogout, cart, navigateToCart }) {
  const totalItems = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);

  return (
    <Row className="g-0">
      <Col xs="auto" className="p-0">
        <Sidebar onLogout={onLogout} />
      </Col>

      <Col className="content flex-grow-1">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-white sticky-top">
          <Form.Control
            type="search"
            placeholder="Search by User, Store & Order"
            className="w-50"
          />
          <div className="d-flex align-items-center gap-3">
            <div
              className="position-relative"
              style={{ cursor: "pointer" }}
              onClick={navigateToCart}
            >
              <FaShoppingCart size={22} className="text-danger" />
              {totalItems > 0 && (
                <Badge
                  bg="danger"
                  pill
                  className="position-absolute top-0 start-100 translate-middle"
                >
                  {totalItems}
                </Badge>
              )}
            </div>
            <Image src="https://i.pravatar.cc/40" roundedCircle alt="profile" />
          </div>
        </div>

        {/* Page content */}
        <div className="p-4">
          <Outlet />
        </div>
      </Col>
    </Row>
  );
}

function App() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cart, setCart] = useState({});

  // ✅ Load from localStorage on app start
  useEffect(() => {
    const user = localStorage.getItem("loggedInUser");
    if (user) setIsLoggedIn(true);

    const savedCart = localStorage.getItem("cart");
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  // ✅ Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    setIsLoggedIn(false);
  };

  const navigateToCart = () => {
    navigate("/cart");
  };

  // ✅ Add to Cart
  const addToCart = (item) => {
    const id = item._id || item.id;
    setCart((prev) => {
      const existing = prev[id] || { ...item, qty: 0 };
    const updatedCart = {
        ...prev,
        [id]: { ...existing, qty: existing.qty + 1 },
      };
      localStorage.setItem("cart", JSON.stringify(updatedCart)); // ✅ Save immediately
      return updatedCart;
    });
  };

  // ✅ Remove from Cart
  const removeFromCart = (item) => {
    const id = item._id || item.id;
    setCart((prev) => {
      if (!prev[id]) return prev;
      const updated = { ...prev };
      if (updated[id].qty <= 1) delete updated[id];
      else updated[id].qty -= 1;

      localStorage.setItem("cart", JSON.stringify(updated)); // ✅ Save immediately
      return updated;
    });
  };

  return (
    <Container fluid className="g-0">
      <Routes>
        {!isLoggedIn ? (
          <>
            <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        ) : (
          <Route
            element={
              <DashboardLayout
                onLogout={handleLogout}
                cart={cart}
                navigateToCart={navigateToCart}
              />
            }
          >
            <Route path="/orders" element={<Orders />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/map" element={<MapView />} />

            <Route
              path="/stores"
              element={<Stores addToCart={addToCart} removeFromCart={removeFromCart} cart={cart} />}
            />

            <Route path="/reviews" element={<Reviews />} />
            <Route
              path="/products"
              element={<Products addToCart={addToCart} removeFromCart={removeFromCart} cart={cart} />}
            />
            <Route path="/settings" element={<Settings />} />
            <Route
              path="/cart"
              element={
                <Cart
                  cart={cart}
                  addToCart={addToCart}
                  removeFromCart={removeFromCart}
                  clearCart={() => {
                    setCart({});
                    localStorage.removeItem("cart");
                  }}
                />
              }
            />
            <Route path="*" element={<Navigate to="/orders" />} />
          </Route>
        )}
      </Routes>
    </Container>
  );
}

export default App;
