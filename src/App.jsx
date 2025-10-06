// App.jsx
import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  NavLink,
  Navigate,
  Outlet,
  useNavigate,
} from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Form,
  Image,
  Button,
  Badge,
} from "react-bootstrap";
import { FaShoppingCart } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

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

function DashboardLayout({ onLogout, cart, addToCart, removeFromCart }) {
  const navigate = useNavigate();
  const totalItems = Object.values(cart).reduce(
    (sum, item) => sum + item.qty,
    0
  );

  return (
    <Row className="g-0">
      {/* Sidebar */}
      <Col xs={2} className="bg-dark text-white sidebar d-flex flex-column p-3">
        <h4 className="sidebar-logo text-danger mb-4">E-Meat</h4>
        <nav className="flex-grow-1">
          <ul className="nav flex-column">
            <li className="nav-item">
              <NavLink to="/orders" className="nav-link text-white">
                Orders
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/customers" className="nav-link text-white">
                Customers
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/drivers" className="nav-link text-white">
                Drivers
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/map" className="nav-link text-white">
                Map View
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/stores" className="nav-link text-white">
                Stores
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/reviews" className="nav-link text-white">
                Reviews
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/products" className="nav-link text-white">
                Products
              </NavLink>
            </li>
          </ul>
        </nav>
        <div>
          <hr className="border-light" />
          <Button variant="danger" className="mt-3 w-100" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </Col>

      {/* Main Content */}
      <Col xs={10} className="content">
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-white">
          <Form.Control
            type="search"
            placeholder="Search by User, Store & Order"
            className="w-50"
          />
          <div className="d-flex align-items-center gap-3">
            <div
              className="position-relative"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/cart")}
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
        <div className="p-4">
          <Outlet />
        </div>
      </Col>
    </Row>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cart, setCart] = useState({});
  const [userAddress, setUserAddress] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("loggedInUser");
    if (user) setIsLoggedIn(true);
    const savedCart = localStorage.getItem("cart");
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("cart");
    setIsLoggedIn(false);
    setCart({});
  };

  const addToCart = (item) => {
    setCart((prev) => {
      if (prev[item.id]) {
        return {
          ...prev,
          [item.id]: { ...prev[item.id], qty: prev[item.id].qty + 1 },
        };
      }
      return { ...prev, [item.id]: { ...item, qty: 1 } };
    });
  };

  const removeFromCart = (item) => {
    setCart((prev) => {
      if (!prev[item.id]) return prev;
      const newQty = prev[item.id].qty - 1;
      if (newQty <= 0) {
        const { [item.id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [item.id]: { ...prev[item.id], qty: newQty } };
    });
  };

  const clearCart = () => setCart({});

  return (
    <Container fluid className="g-0">
      <Routes>
        {!isLoggedIn ? (
          <>
            <Route
              path="/login"
              element={<Login onLogin={() => setIsLoggedIn(true)} />}
            />
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
                addToCart={addToCart}
                removeFromCart={removeFromCart}
              />
            }
          >
            <Route path="/orders" element={<Orders />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/map" element={<MapView />} />
            <Route
              path="/stores"
              element={
                <Stores
                  addToCart={addToCart}
                  removeFromCart={removeFromCart}
                  cart={cart}
                />
              }
            />
            <Route path="/reviews" element={<Reviews />} />
            <Route
              path="/products"
              element={
                <Products
                  addToCart={addToCart}
                  setUserAddress={setUserAddress}
                />
              }
            />
            <Route
              path="/cart"
              element={
                <Cart
                  cart={cart}
                  addToCart={addToCart}
                  removeFromCart={removeFromCart}
                  clearCart={clearCart}
                  userAddress={userAddress}
                />
              }
            />
            <Route path="*" element={<h4>Welcome to E-Meat Dashboard</h4>} />
          </Route>
        )}
      </Routes>
    </Container>
  );
}

export default App;
