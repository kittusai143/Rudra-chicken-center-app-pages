import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Image,
  Card,
  Form,
  Alert,
} from "react-bootstrap";

const STORE_COORDS = { lat: 17.385044, lng: 78.486671 };

// ✅ Indian States
const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const Cart = ({ cart, addToCart, removeFromCart, clearCart }) => {
  const cartItems = Object.values(cart);
  const [errorMsg, setErrorMsg] = useState("");
  const [distance, setDistance] = useState(0);
  const [shipping, setShipping] = useState(0);

  const [cities, setCities] = useState([]);
  const [pincodeList, setPincodeList] = useState([]);

  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    state: "",
    city: "",
    pincode: "",
  });

  const [errors, setErrors] = useState({});

  // ✅ Validation
  const validateField = (name, value) => {
    let message = "";
    switch (name) {
      case "name":
        if (!/^[a-zA-Z\s]+$/.test(value)) message = "Enter a valid name.";
        break;
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          message = "Enter a valid email.";
        break;
      case "phone":
        if (!/^[6-9]\d{9}$/.test(value)) message = "Enter valid phone number.";
        break;
      case "address":
        if (value.length < 5) message = "Enter full address.";
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: message }));
  };

  // ✅ Handle field change
  const handleChange = async (e) => {
    const { name, value } = e.target;
    setCustomerDetails((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);

    if (name === "state") {
      setCustomerDetails((prev) => ({ ...prev, city: "", pincode: "" }));
      setCities([]);
      setPincodeList([]);
      fetchCities(value);
    }

    if (name === "city") {
      setCustomerDetails((prev) => ({ ...prev, pincode: "" }));
      setPincodeList([]);
      fetchPincodes(value);
    }
  };

  const fetchCities = async (stateName) => {
  try {
    const res = await fetch(
      `https://api.postalpincode.in/state/${encodeURIComponent(stateName)}`
    );
    const data = await res.json();

    if (data && data[0]?.Status === "Success") {
      let allCities = data[0].PostOffice.map(po => po.District.trim());
      let uniqueCities = [...new Set(allCities)];

      // Normalize variants containing "jagt"
      uniqueCities = uniqueCities.map(city => {
        if (/jagt/i.test(city)) return "Jagtial";
        return city;
      });

      // Ensure “Jagtial” is present
      if (stateName === "Telangana" && !uniqueCities.includes("Jagtial")) {
        uniqueCities.push("Jagtial");
      }

      setCities(uniqueCities.sort());
    } else {
      // fallback (for instance Telangana) with a default list
      if (stateName === "Telangana") {
        setCities(["Hyderabad", "Karimnagar", "Jagtial", "Warangal", /* etc */]);
      } else {
        setCities([]);
      }
    }
  } catch (err) {
    console.error("City fetch error:", err);
    if (stateName === "Telangana") {
      setCities(["Hyderabad", "Karimnagar", "Jagtial", "Warangal"]);
    } else {
      setCities([]);
    }
  }
};


  // ✅ Fetch pincodes for selected city
  const fetchPincodes = async (cityName) => {
    try {
      const res = await fetch(
        `https://api.postalpincode.in/postoffice/${encodeURIComponent(cityName)}`
      );
      const data = await res.json();
      if (data[0].Status === "Success") {
        const pins = data[0].PostOffice.map((po) => po.Pincode);
        const uniquePins = [...new Set(pins)];
        setPincodeList(uniquePins.sort());
      } else {
        setPincodeList([]);
      }
    } catch (err) {
      console.error("Pincode fetch error:", err);
      setPincodeList([]);
    }
  };

  // ✅ Calculate distance using Google API
  useEffect(() => {
    const { address, city, state, pincode } = customerDetails;
    if (!address || !city || !state || !pincode) {
      setDistance(0);
      setShipping(0);
      return;
    }

    const fetchDistance = async () => {
      try {
        const apiKey = "AIzaSyAOHcP2ewAbubKCTT08dWeFlHZatrfqFcg";
        const origins = `${STORE_COORDS.lat},${STORE_COORDS.lng}`;
        const destination = `${address}, ${city}, ${state}, ${pincode}`;
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
          origins
        )}&destinations=${encodeURIComponent(destination)}&units=metric&key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (
          data.status === "OK" &&
          data.rows.length > 0 &&
          data.rows[0].elements[0].status === "OK"
        ) {
          const distanceMeters = data.rows[0].elements[0].distance.value;
          const distKm = distanceMeters / 1000;
          setDistance(distKm);
          const baseRate = 30;
          const perKmRate = 2;
          const calcShipping =
            cartItems.length > 0 ? baseRate + distKm * perKmRate : 0;
          setShipping(calcShipping);
          setErrorMsg("");
        } else {
          setErrorMsg("Could not find address. Please check your entry.");
          setDistance(0);
          setShipping(0);
        }
      } catch (err) {
        console.error("Error fetching distance:", err);
        setErrorMsg("Failed to calculate shipping.");
      }
    };

    fetchDistance();
  }, [customerDetails.address, customerDetails.city, customerDetails.state, customerDetails.pincode]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const total = subtotal + shipping;

  const handleCheckout = () => {
    const hasErrors = Object.values(errors).some((msg) => msg);
    const hasEmpty = Object.values(customerDetails).some((val) => !val);
    if (hasErrors || hasEmpty) {
      alert("⚠️ Please fix validation errors before checkout.");
      return;
    }

    alert(
      `✅ Order Placed!\nCustomer: ${customerDetails.name}\nCity: ${customerDetails.city}\nPincode: ${customerDetails.pincode}\nTotal: ₹${total.toFixed(
        2
      )}`
    );

    clearCart();
  };

  return (
    <Container className="py-4">
      <Row>
        {/* 🛒 Cart Items */}
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
                    <td className="text-center">
                      ₹{(item.price * item.qty).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Col>

        {/* 📦 Customer + Order Summary */}
        <Col md={4}>
          <Card className="p-3 mb-3">
            <h5>Customer Details</h5>
            {errorMsg && <Alert variant="warning">{errorMsg}</Alert>}
            <Form>
              {["name", "email", "phone", "address"].map((field) => (
                <Form.Group className="mb-2" key={field}>
                  <Form.Label className="text-capitalize">{field}</Form.Label>
                  <Form.Control
                    type="text"
                    name={field}
                    value={customerDetails[field]}
                    onChange={handleChange}
                    isInvalid={!!errors[field]}
                    placeholder={`Enter ${field}`}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors[field]}
                  </Form.Control.Feedback>
                </Form.Group>
              ))}

              {/* State Dropdown */}
              <Form.Group className="mb-2">
                <Form.Label>State</Form.Label>
                <Form.Select
                  name="state"
                  value={customerDetails.state}
                  onChange={handleChange}
                >
                  <option value="">Select State</option>
                  {STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* City Dropdown */}
              {cities.length > 0 && (
                <Form.Group className="mb-2">
                  <Form.Label>City</Form.Label>
                  <Form.Select
                    name="city"
                    value={customerDetails.city}
                    onChange={handleChange}
                  >
                    <option value="">Select City</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}

              {/* Pincode Dropdown */}
              {pincodeList.length > 0 && (
                <Form.Group className="mb-2">
                  <Form.Label>Pincode</Form.Label>
                  <Form.Select
                    name="pincode"
                    value={customerDetails.pincode}
                    onChange={handleChange}
                  >
                    <option value="">Select Pincode</option>
                    {pincodeList.map((pin) => (
                      <option key={pin} value={pin}>
                        {pin}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}
            </Form>
          </Card>

          {/* ✅ Order Summary */}
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
            <Button
              variant="success"
              className="w-100 mt-3"
              onClick={handleCheckout}
            >
              Place Order
            </Button>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart;
