import React, { useState, useEffect } from "react";
import { Card, Form, Button, Row, Col, Alert, Spinner } from "react-bootstrap";
import { FaCamera } from "react-icons/fa";
import "./css/Settings.css";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);

  // Load logged-in user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setPreview(userData.profilePic || null);
    }
  }, []);

  // Fetch user's orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const res = await fetch("http://localhost:5000/api/orders");
        const data = await res.json();
        const userOrders = data.filter(
          (o) =>
            o.customerMobile === user.phone || o.customerEmail === user.email
        );
        setOrders(userOrders);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  // Handle input change
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // Handle file upload for profile picture
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      alert("Only JPG or PNG files are allowed.");
      return;
    }

    setProfilePic(file);
    setPreview(URL.createObjectURL(file));
  };

  // Save user updates to backend
  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("firstName", user.firstName || "");
      formData.append("lastName", user.lastName || "");
      formData.append("email", user.email || "");
      formData.append("phone", user.phone || "");
      if (profilePic) {
        formData.append("profilePic", profilePic);
      }

      const res = await fetch("http://localhost:5000/api/user/update", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to save user data");

      const updatedUser = await res.json();
      localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save user details.");
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading your details...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Alert variant="danger" className="mt-4 text-center">
        No user found. Please login again.
      </Alert>
    );
  }

  return (
    <div className="profile-container container my-4">
      {/* Profile Card */}
      <Card className="p-4 shadow-sm mb-4 border-0 text-center">
        <h5 className="fw-bold mb-4">User Profile</h5>

        {/* Profile Image Section */}
        <div className="position-relative d-flex justify-content-center mb-4">
          <img
            src={
              preview || "https://www.w3schools.com/howto/img_avatar.png"
            }
            alt="Profile"
            className="rounded-circle shadow-sm"
            style={{
              width: "120px",
              height: "120px",
              objectFit: "cover",
              border: "4px solid #fff",
            }}
          />

          {editing && (
            <>
              <label
                htmlFor="fileUpload"
                className="position-absolute bg-primary rounded-circle d-flex justify-content-center align-items-center"
                style={{
                  width: "32px",
                  height: "32px",
                  bottom: "0",
                  right: "calc(50% - 60px)", // positions icon on image circle edge
                  cursor: "pointer",
                }}
              >
                <FaCamera color="white" size={14} />
              </label>
              <input
                id="fileUpload"
                type="file"
                accept=".jpg,.png"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </>
          )}
        </div>

        {/* User Details Form */}
        <Form className="text-start px-2">
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">First Name</Form.Label>
            <Form.Control
              type="text"
              name="firstName"
              value={user.firstName || ""}
              onChange={handleChange}
              disabled={!editing}
              className="rounded-pill"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Last Name</Form.Label>
            <Form.Control
              type="text"
              name="lastName"
              value={user.lastName || ""}
              onChange={handleChange}
              disabled={!editing}
              className="rounded-pill"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">E-Mail</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={user.email || ""}
              onChange={handleChange}
              disabled={!editing}
              className="rounded-pill"
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Mobile</Form.Label>
            <Form.Control
              type="text"
              name="phone"
              value={user.phone || ""}
              onChange={handleChange}
              disabled={!editing}
              className="rounded-pill"
            />
          </Form.Group>

          <Button
            variant={editing ? "primary" : "secondary"}
            onClick={editing ? handleSave : () => setEditing(true)}
            className="w-100 rounded-pill fw-bold"
          >
            {editing ? "SAVE" : "EDIT"}
          </Button>
        </Form>
      </Card>

      {/* Orders Section */}
      <h5 className="fw-bold mb-3 text-center text-primary">My Orders</h5>
      <Row>
        {orders.length > 0 ? (
          orders.map((o) => (
            <Col xs={12} md={6} lg={4} key={o.id} className="mb-4">
              <Card className="shadow-sm border-primary">
                <Card.Body>
                  <p><strong>Order ID:</strong> {o.id}</p>
                  <p><strong>Product:</strong> {o.productName}</p>
                  <p><strong>KGs:</strong> {o.kgs}</p>
                  <p><strong>Price:</strong> ₹{o.price}</p>
                  <p><strong>Status:</strong> {o.status}</p>
                  <p><strong>Address:</strong> {o.customerAddress}</p>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col>
            <Alert variant="info" className="text-center">
              No orders found.
            </Alert>
          </Col>
        )}
      </Row>
    </div>
  );
}
