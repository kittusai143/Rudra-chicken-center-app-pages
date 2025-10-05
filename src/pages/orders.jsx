// Orders.jsx
import React, { useState, useEffect } from "react";
import { Form, Button, Table, Card, Row, Col } from "react-bootstrap";
import "./css/orders.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    id: "",
    customerName: "",
    customerMobile: "",
    customerEmail: "",
    customerAddress: "",
    kgs: "",
    productName: "Chicken",
    status: "Pending",
  });

  const CHICKEN_PRICE_PER_KG = 200;
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/orders");
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      }
    };
    fetchOrders();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.id.trim()) newErrors.id = "Order ID is required";
    if (!form.customerName.trim()) newErrors.customerName = "Name is required";
    if (!/^\d{10}$/.test(form.customerMobile))
      newErrors.customerMobile = "Enter valid 10-digit mobile";
    if (!/\S+@\S+\.\S+/.test(form.customerEmail))
      newErrors.customerEmail = "Enter valid email";
    if (!form.customerAddress.trim())
      newErrors.customerAddress = "Delivery address is required";
    if (form.kgs < 1) newErrors.kgs = "KGs must be at least 1";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const kgsNumber = Number(form.kgs);
    const newOrder = {
      ...form,
      kgs: kgsNumber,
      price: kgsNumber * CHICKEN_PRICE_PER_KG,
    };

    try {
      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });
      const data = await res.json();
      setOrders((prev) => [...prev, data.order]);

      setForm({
        id: "",
        customerName: "",
        customerMobile: "",
        customerEmail: "",
        customerAddress: "",
        kgs: 1,
        productName: "Chicken",
        status: "Pending",
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container my-4">
      <Card className="p-4 mb-4 shadow">
        <h4 className="mb-3">Add New Order</h4>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Order ID</Form.Label>
                <Form.Control
                  name="id"
                  value={form.id}
                  onChange={handleChange}
                  isInvalid={!!errors.id}
                  placeholder="Enter Order ID"
                />
                <Form.Control.Feedback type="invalid">{errors.id}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Customer Name</Form.Label>
                <Form.Control
                  name="customerName"
                  value={form.customerName}
                  onChange={handleChange}
                  isInvalid={!!errors.customerName}
                  placeholder="Enter Name"
                />
                <Form.Control.Feedback type="invalid">{errors.customerName}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Mobile</Form.Label>
                <Form.Control
                  name="customerMobile"
                  value={form.customerMobile}
                  onChange={handleChange}
                  isInvalid={!!errors.customerMobile}
                  placeholder="Enter Mobile"
                />
                <Form.Control.Feedback type="invalid">{errors.customerMobile}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  name="customerEmail"
                  value={form.customerEmail}
                  onChange={handleChange}
                  isInvalid={!!errors.customerEmail}
                  placeholder="Enter Email"
                />
                <Form.Control.Feedback type="invalid">{errors.customerEmail}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Delivery Address</Form.Label>
                <Form.Control
                  name="customerAddress"
                  value={form.customerAddress}
                  onChange={handleChange}
                  isInvalid={!!errors.customerAddress}
                  placeholder="Enter Address"
                />
                <Form.Control.Feedback type="invalid">{errors.customerAddress}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>KGs</Form.Label>
                <Form.Control
                  type="number"
                  name="kgs"
                  value={form.kgs}
                  onChange={handleChange}
                  isInvalid={!!errors.kgs}
                  placeholder="Enter kgs"
                />
                <Form.Control.Feedback type="invalid">{errors.kgs}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col className="d-flex justify-content-end">
              <Button type="submit" className="btn-add-order">
                Add Order
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card className="p-3 shadow">
        <h4 className="mb-3">Orders List</h4>
        <Table bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>Email</th>
              <th>Address</th>
              <th>Product</th>
              <th>KGs</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((o, idx) => (
                <tr key={idx}>
                  <td>{o.id}</td>
                  <td>{o.customerName}</td>
                  <td>{o.customerMobile}</td>
                  <td>{o.customerEmail}</td>
                  <td>{o.customerAddress}</td>
                  <td>{o.productName}</td>
                  <td>{o.kgs}</td>
                  <td>₹{o.price}</td>
                  <td>{o.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center text-muted">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};

export default Orders;
