import React, { useState } from "react";
import { Card, Form, Button, InputGroup, Row, Col } from "react-bootstrap";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Register.css";

// Vite env fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Register() {
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ identifier: "", password: "" });
  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^[0-9]{10}$/.test(phone);
  const validatePassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));

    if (name === "identifier") {
      setErrors((prev) => ({
        ...prev,
        identifier: !value
          ? "This field is required"
          : validateEmail(value) || validatePhone(value)
          ? ""
          : "Enter a valid email or 10-digit phone number",
      }));
    }

    if (name === "password") {
      setErrors((prev) => ({
        ...prev,
        password: !value
          ? "This field is required"
          : validatePassword(value)
          ? ""
          : "Password must be 8+ chars, include uppercase, lowercase, number & special char",
      }));
    }
  };

  const handleRegister = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const newErrors = {};
    if (!formData.identifier) newErrors.identifier = "This field is required";
    else if (!validateEmail(formData.identifier) && !validatePhone(formData.identifier))
      newErrors.identifier = "Enter a valid email or 10-digit phone number";

    if (!formData.password) newErrors.password = "This field is required";
    else if (!validatePassword(formData.password))
      newErrors.password = "Password must be 8+ chars, include uppercase, lowercase, number & special char";

    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text || "Server response not JSON" };
      }

      if (res.ok) {
        alert(data.message || "✅ Registered successfully!");
        navigate("/login");
      } else {
        alert(`⚠️ ${data.error || "Registration failed"}`);
      }
    } catch (err) {
      console.error("Register error:", err);
      alert("❌ Server not responding. Please try again later.");
    }
  };

  return (
    <div className="register-bg d-flex justify-content-center align-items-center vh-100">
      <Row className="w-100 justify-content-center">
        <Col xs={11} sm={8} md={5} lg={4}>
          <Card className="p-4 register-card">
            <h5 className="mb-3 text-center">Create Account</h5>

            <Form onSubmit={handleRegister}>
              <Form.Group className="mb-3">
                <Form.Label>Email or Phone Number</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FaUser />
                  </InputGroup.Text>
                  <Form.Control
                    name="identifier"
                    type="text"
                    placeholder="Enter email or phone number"
                    value={formData.identifier}
                    onChange={handleChange}
                    className={errors.identifier ? "is-invalid" : formData.identifier ? "is-valid" : ""}
                  />
                </InputGroup>
                {errors.identifier && <div className="invalid-feedback d-block">{errors.identifier}</div>}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FaLock />
                  </InputGroup.Text>
                  <Form.Control
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? "is-invalid" : formData.password ? "is-valid" : ""}
                  />
                  <InputGroup.Text style={{ cursor: "pointer" }} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </InputGroup.Text>
                </InputGroup>
                {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
              </Form.Group>

              <Button className="btn-signin w-100 mb-2" type="submit">
                Register
              </Button>

              <div className="text-center mt-2">
                <Button variant="link" onClick={() => navigate("/login")} type="button">
                  Back to Login
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
