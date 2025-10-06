import React, { useState, useEffect } from "react";
import { Container, Row, Col, Table, Button, Image, Card, Form } from "react-bootstrap";

// Simulate store coordinates (Hyderabad)
const STORE_COORDS = { lat: 17.385044, lng: 78.486671 };

// Haversine formula to calculate distance between two lat/lng points
const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const Cart = ({ cart, addToCart, removeFromCart, clearCart }) => {
  const cartItems = Object.values(cart);

  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [distance, setDistance] = useState(0);
  const [shipping, setShipping] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails((prev) => ({ ...prev, [name]: value }));
  };

  // Calculate distance using Google Maps API whenever address changes
  useEffect(() => {
    if (!customerDetails.address) return;

    const fetchDistance = async () => {
      try {
        const apiKey = "YOUR_GOOGLE_MAPS_API_KEY"; // replace with your key
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            customerDetails.address
          )}&key=${apiKey}`
        );
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry.location;
          const dist = getDistanceKm(STORE_COORDS.lat, STORE_COORDS.lng, lat, lng);
          setDistance(dist);
          const baseRate = 30;
          const perKmRate = 2;
          setShipping(cartItems.length > 0 ? baseRate + dist * perKmRate : 0);
        }
      } catch (err) {
        console.error("Error calculating distance:", err);
      }
    };

    fetchDistance();
  }, [customerDetails.address, cartItems]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    // Validate all customer fields
    for (let key in customerDetails) {
      if (!customerDetails[key]) {
        alert(`⚠️ Please fill in ${key} before checkout.`);
        return;
      }
    }

    alert(
      `✅ Order Placed!\n\n` +
        `Customer: ${customerDetails.name}\n` +
        `Email: ${customerDetails.email}\n` +
        `Phone: ${customerDetails.phone}\n` +
        `Address: ${customerDetails.address}, ${customerDetails.city}, ${customerDetails.state} - ${customerDetails.pincode}\n` +
        `Distance: ${distance.toFixed(2)} km\n` +
        `Shipping: ₹${shipping.toFixed(2)}\n` +
        `Total: ₹${total.toFixed(2)}`
    );
    clearCart();
    setCustomerDetails({
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    });
    setDistance(0);
    setShipping(0);
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
                        <Button size="sm" variant="danger" onClick={() => removeFromCart(item)}>
                          −
                        </Button>
                        <span>{item.qty}</span>
                        <Button size="sm" variant="success" onClick={() => addToCart(item)}>
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
          <Card className="p-3 mb-3">
            <h5>Customer Details</h5>
            <Form>
              <Form.Group className="mb-2">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={customerDetails.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={customerDetails.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={customerDetails.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="address"
                  value={customerDetails.address}
                  onChange={handleChange}
                  placeholder="Enter full address"
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>City</Form.Label>
                <Form.Control
                  type="text"
                  name="city"
                  value={customerDetails.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>State</Form.Label>
                <Form.Control
                  type="text"
                  name="state"
                  value={customerDetails.state}
                  onChange={handleChange}
                  placeholder="Enter state"
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Pincode</Form.Label>
                <Form.Control
                  type="text"
                  name="pincode"
                  value={customerDetails.pincode}
                  onChange={handleChange}
                  placeholder="Enter pincode"
                />
              </Form.Group>
            </Form>
          </Card>

          <Card className="p-3">
            <h5>Order Summary</h5>
            <hr />
            <div className="d-flex justify-content-between">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span>Shipping ({distance.toFixed(2)} km)</span>
              <span>₹{shipping.toFixed(2)}</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between fw-bold">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <Button variant="success" className="w-100 mt-3" onClick={handleCheckout}>
              Place Order
            </Button>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart;
