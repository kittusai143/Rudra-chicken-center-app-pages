import React, { useState } from "react";
import { Row, Col, Card, Form, Button, InputGroup } from "react-bootstrap";
import { FaUser, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState(""); // email or phone
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateIdentifier = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/; // ✅ 10-digit phone number
    return emailRegex.test(value) || phoneRegex.test(value);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setIdentifier(value);

    if (!value) {
      setError("This field is required");
    } else if (!validateIdentifier(value)) {
      setError("Enter a valid email or phone number");
    } else {
      setError(""); // ✅ clear instantly if valid
    }
  };

  const handleForgotPassword = async () => {
  if (!identifier) {
    setError("This field is required");
    return;
  } else if (!validateIdentifier(identifier)) {
    setError("Enter a valid email or phone number");
    return;
  }
  setError("");

  try {
    const res = await fetch("http://localhost:5000/send-reset", {  // ✅ unified route
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier }), // ✅ unified key
    });

    const data = await res.json();
    if (res.ok) {
      alert(data.message);

      // ✅ Always go to VerifyOtp (email or phone)
      navigate(`/verify-otp?identifier=${identifier}`);
    } else {
      alert("❌ " + data.error);
    }
  } catch (err) {
    alert("⚠️ Failed to send OTP.");
    console.error(err);
  }
};


  const isValid = identifier && validateIdentifier(identifier) && !error;

  return (
    <div className="register-bg d-flex justify-content-center align-items-center vh-100">
      <Row className="w-100 justify-content-center">
        <Col xs={11} sm={8} md={5} lg={4}>
          <Card className="p-4 register-card">
            <h5 className="mb-3 text-center">Forgot Password</h5>

            {/* Email or Phone */}
            <Form.Group className="mb-3">
              <Form.Label>Email or Phone Number</Form.Label>
              <InputGroup size="sm" className="position-relative">
                <InputGroup.Text>
                  <FaUser />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Enter email or phone"
                  value={identifier}
                  onChange={handleChange}
                  isInvalid={!!error}
                  isValid={isValid}
                />
                {isValid && (
                  <span className="valid-icon">
                    <FaCheckCircle />
                  </span>
                )}
              </InputGroup>
              {error && (
                <Form.Text className="text-danger">{error}</Form.Text>
              )}
            </Form.Group>

            <Button
              className="btn-signin w-100 mb-2"
              onClick={handleForgotPassword}
            >
              Send Reset Link / OTP
            </Button>

            <div className="text-center mt-2">
              <Button variant="link" onClick={() => navigate("/login")}>
                Back to Login
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
