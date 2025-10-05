import React from "react";
import { Nav } from "react-bootstrap";

export default function Sidebar() {
  return (
    <div className="d-flex flex-column text-white vh-100">
      <div className="p-3 border-bottom">
        <h5 className="text-white">E-Meat</h5>
        <small className="text-secondary">meat</small>
      </div>

      <Nav className="flex-column mt-3">
        <Nav.Link href="#" className="text-white"><i className="fas fa-box me-2"></i> Orders</Nav.Link>
        <Nav.Link href="#" className="text-white"><i className="fas fa-users me-2"></i> Customers</Nav.Link>
        <Nav.Link href="#" className="text-white"><i className="fas fa-car me-2"></i> Drivers</Nav.Link>
        <Nav.Link href="#" className="text-white"><i className="fas fa-map me-2"></i> Map View</Nav.Link>

        <Nav.Link href="/" className="text-white bg-danger mt-2"><i className="fas fa-store me-2"></i> Stores</Nav.Link>
        <Nav.Link href="#" className="text-white"><i className="fas fa-star me-2"></i> Reviews</Nav.Link>
        <Nav.Link href="#" className="text-white"><i className="fas fa-boxes me-2"></i> Products</Nav.Link>

        <hr className="text-secondary" />
        <Nav.Link href="#" className="text-white"><i className="fas fa-cog me-2"></i> Settings</Nav.Link>
      </Nav>

      <div className="mt-auto p-3 small text-secondary">
        Powered by <span className="text-white">Orderly</span>
      </div>
    </div>
  );
}
