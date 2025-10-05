// Stores.jsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Image,
  Button,
  Form,
  Table,
  Card,
} from "react-bootstrap";

const Stores = ({ addToCart, removeFromCart, cart }) => {
  const [stores, setStores] = useState([]);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/stores");
        const data = await res.json();
        setStores(data);
      } catch (err) {
        console.error("Failed to fetch stores:", err);
      }
    };
    fetchStores();
  }, []);

  // Total items in cart
  const getTotalItems = () =>
    Object.values(cart).reduce((acc, item) => acc + item.qty, 0);

  // Subtotal of items in cart
  const getSubtotal = () =>
    stores.reduce(
      (acc, item) => acc + (cart[item.id] ? cart[item.id].qty * item.price : 0),
      0
    );

  const shipping = 5.0;
  const subtotal = getSubtotal();
  const totalCost = subtotal + shipping;

  return (
    <Container fluid className="bg-light min-vh-100 p-4">
      <Row>
        {/* LEFT SIDE: Product list */}
        <Col md={8} className="bg-white p-4 rounded shadow-sm">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold mb-0">Shopping Cart</h4>
            <span className="text-muted fw-semibold">
              {getTotalItems()} Items
            </span>
          </div>

          <Table borderless hover responsive>
            <thead>
              <tr className="text-uppercase text-secondary small border-bottom">
                <th>Product Details</th>
                <th className="text-center">Quantity</th>
                <th className="text-center">Price</th>
                <th className="text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((item) => (
                <tr key={item.id} className="align-middle border-bottom">
                  <td className="d-flex align-items-center">
                    <Image
                      src={item.image || "https://via.placeholder.com/70"}
                      alt={item.name}
                      width={70}
                      height={70}
                      className="me-3 rounded"
                    />
                    <div>
                      <h6 className="mb-1 fw-semibold">{item.name}</h6>
                      <small className="text-danger">Chicken</small>
                      <div>
                        {cart[item.id] && cart[item.id].qty > 0 && (
                          <Button
                            variant="link"
                            className="text-decoration-none text-muted p-0 small"
                            onClick={() => removeFromCart(item)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="text-center">
                    <div className="d-inline-flex align-items-center border rounded px-2">
                      <Button
                        variant="link"
                        className="p-0 text-dark"
                        onClick={() => removeFromCart(item)}
                      >
                        −
                      </Button>
                      <span className="mx-2 fw-semibold">
                        {cart[item.id] ? cart[item.id].qty : 0}
                      </span>
                      <Button
                        variant="link"
                        className="p-0 text-dark"
                        onClick={() => addToCart(item)}
                      >
                        +
                      </Button>
                    </div>
                  </td>

                  <td className="text-center">₹{item.price}</td>
                  <td className="text-center">
                    ₹{(item.price * (cart[item.id]?.qty || 0)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="mt-3">
            <Button
              variant="link"
              className="text-primary text-decoration-none fw-semibold"
            >
              ← Continue Shopping
            </Button>
          </div>
        </Col>

        {/* RIGHT SIDE: Order Summary */}
        <Col md={4}>
          <Card className="p-4 shadow-sm">
            <h5 className="fw-bold mb-3">Order Summary</h5>

            <div className="d-flex justify-content-between mb-2">
              <span>Items ({getTotalItems()})</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <span>Shipping</span>
              <Form.Select size="sm" className="w-50">
                <option>Standard Delivery - ₹{shipping.toFixed(2)}</option>
                <option>Express Delivery - ₹10.00</option>
              </Form.Select>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Promo Code</Form.Label>
              <Form.Control type="text" placeholder="Enter your code" />
            </Form.Group>

            <Button variant="danger" className="w-100 mb-3">
              Apply
            </Button>

            <hr />
            <div className="d-flex justify-content-between fw-bold mb-2">
              <span>Total Cost</span>
              <span>₹{totalCost.toFixed(2)}</span>
            </div>

            <Button variant="primary" className="w-100">
              Checkout
            </Button>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Stores;
