// Cart.jsx
import React from "react";
import { Container, Row, Col, Table, Button, Image, Card } from "react-bootstrap";

const Cart = ({ cart, addToCart, removeFromCart, clearCart }) => {
  const cartItems = Object.values(cart);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = cartItems.length > 0 ? 5.0 : 0;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    alert("Thank you for your purchase!");
    clearCart();
  };

  return (
    <Container className="py-4">
      <Row>
        <Col md={8}>
          <h3 className="mb-3">Shopping Cart</h3>
          {cartItems.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            <Table borderless responsive>
              <thead>
                <tr>
                  <th>Product</th>
                  <th className="text-center">Qty</th>
                  <th className="text-center">Price</th>
                  <th className="text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id}>
                    <td className="d-flex align-items-center">
                      <Image
                        src={item.image || "https://via.placeholder.com/70"}
                        rounded
                        width={70}
                        height={70}
                        className="me-3"
                      />
                      <div>
                        <h6>{item.name}</h6>
                        <p className="mb-0 text-muted">{item.category}</p>
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center align-items-center gap-2">
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => removeFromCart(item)}
                        >
                          −
                        </Button>
                        <span>{item.qty}</span>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => addToCart(item)}
                        >
                          +
                        </Button>
                      </div>
                    </td>
                    <td className="text-center">₹{item.price}</td>
                    <td className="text-center">₹{(item.price * item.qty).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Col>

        <Col md={4}>
          <Card className="p-3">
            <h5>Order Summary</h5>
            <hr />
            <div className="d-flex justify-content-between">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span>Shipping</span>
              <span>₹{shipping.toFixed(2)}</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between fw-bold">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <Button
              variant="primary"
              className="w-100 mt-3"
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
            >
              Checkout
            </Button>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart;
