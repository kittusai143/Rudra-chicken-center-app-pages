// Sidebar.jsx
import React, { useState } from "react";
import { Nav, Button, Offcanvas } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar({ onLogout }) {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const navItems = [
    { to: "/orders", icon: "fa-box", label: "Orders" },
    { to: "/customers", icon: "fa-users", label: "Customers" },
    { to: "/drivers", icon: "fa-car", label: "Drivers" },
    { to: "/map", icon: "fa-map", label: "Map View" },
    { to: "/stores", icon: "fa-store", label: "Stores" },
    { to: "/reviews", icon: "fa-star", label: "Reviews" },
    { to: "/products", icon: "fa-boxes", label: "Products" },
  ];

  return (
    <>
      {/* ✅ Mobile Header */}
      <div className="mobile-header d-md-none p-2 bg-maroon text-white d-flex align-items-center">
        <Button
          variant="outline-light"
          size="sm"
          onClick={handleShow}
          className="border-0 me-2"
        >
          <i className="fas fa-bars"></i>
        </Button>
        <span className="fw-bold fs-4">E-Meat</span>
      </div>

      {/* ✅ Desktop Sidebar */}
      <div className="sidebar d-none d-md-flex flex-column text-white">
        <div className="sidebar-header p-3 border-bottom border-light">
          <h4 className="fw-bold text-white m-0">E-Meat</h4>
          <small className="text-light opacity-75">Dashboard</small>
        </div>

        <Nav className="flex-column mt-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="nav-link text-white"
            >
              <i className={`fas ${item.icon} me-2`}></i>
              {item.label}
            </NavLink>
          ))}

          <hr className="text-light opacity-50" />

          <NavLink to="/settings" className="nav-link text-white">
            <i className="fas fa-cog me-2"></i> Settings
          </NavLink>
        </Nav>

        <div className="p-3 mt-auto">
          <Button variant="light" className="w-100 fw-semibold" onClick={onLogout}>
            Logout
          </Button>
        </div>

        <div className="p-3 small text-light opacity-75">
          Powered by <span className="fw-bold">Orderly</span>
        </div>
      </div>

      {/* ✅ Mobile Offcanvas */}
      <Offcanvas
        show={show}
        onHide={handleClose}
        className="sidebar-offcanvas bg-maroon text-white"
      >
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title className="fw-bold fs-4">E-Meat</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="nav-link text-white"
                onClick={handleClose}
              >
                <i className={`fas ${item.icon} me-2`}></i>
                {item.label}
              </NavLink>
            ))}

            <hr className="text-light opacity-50" />

            <NavLink
              to="/settings"
              className="nav-link text-white"
              onClick={handleClose}
            >
              <i className="fas fa-cog me-2"></i> Settings
            </NavLink>

            <Button
              variant="light"
              className="w-100 mt-3 fw-semibold"
              onClick={() => {
                handleClose();
                onLogout();
              }}
            >
              Logout
            </Button>
          </Nav>

          <div className="mt-3 small text-light opacity-75">
            Powered by <span className="fw-bold">Orderly</span>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
