import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  InputGroup,
} from "react-bootstrap";
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaTwitter,
  FaFacebook,
  FaCheckCircle,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import Rudra from "./Rudra-chicken-center/Rudra.jpeg";

export default function Login({ onLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [errors, setErrors] = useState({ identifier: "", password: "" });
  const [valid, setValid] = useState({ identifier: false, password: false });
  const [touched, setTouched] = useState({ identifier: false, password: false });

  const navigate = useNavigate();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10}$/;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });

    if (name === "identifier") {
      setValid({ ...valid, identifier: emailRegex.test(value) || phoneRegex.test(value) });
    }
    if (name === "password") {
      setValid({ ...valid, password: value.trim().length >= 6 });
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
  };

  // ✅ Normal login
  const handleLogin = async () => {
    let newErrors = {};
    setTouched({ identifier: true, password: true });

    if (!formData.identifier.trim()) newErrors.identifier = "This field is required";
    else if (!emailRegex.test(formData.identifier) && !phoneRegex.test(formData.identifier))
      newErrors.identifier = "Enter a valid email or phone";

    if (!formData.password.trim()) newErrors.password = "This field is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        localStorage.setItem("loggedInUser", JSON.stringify(data.user));
        onLogin();
        navigate("/orders");
      } else {
        alert("❌ " + data.error);
      }
    } catch (err) {
      alert("⚠️ Login failed");
    }
  };

  // ✅ Mock social login
  const handleSocialLogin = (platform) => {
    const dummyUser = {
      name: `${platform.charAt(0).toUpperCase() + platform.slice(1)} User`,
      email: `${platform}@example.com`,
      uid: Math.floor(Math.random() * 100000),
      platform,
    };
    localStorage.setItem("loggedInUser", JSON.stringify(dummyUser));
    alert(`✅ Logged in as ${dummyUser.name}`);
    onLogin();
    navigate("/orders");
  };

  return (
    <Container fluid className="login-bg d-flex flex-column justify-content-center align-items-center">
      <div className="text-center mb-4">
        <img src={Rudra} alt="Chicken" className="chicken-img" />
        <h1 className="login-title">Rudra Chicken Center</h1>
      </div>

      <Row className="justify-content-center w-100">
        <Col xs={11} sm={8} md={5} lg={4}>
          <Card className="login-card p-4">
            <Form>
              {/* Email/Phone */}
              <Form.Group className="mb-3 position-relative">
                <Form.Label>Email or Phone</Form.Label>
                <InputGroup>
                  <InputGroup.Text><FaUser /></InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="identifier"
                    placeholder="Enter email or phone"
                    value={formData.identifier}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.identifier && !!errors.identifier}
                    isValid={touched.identifier && valid.identifier && !errors.identifier}
                  />
                  {touched.identifier && valid.identifier && !errors.identifier && (
                    <InputGroup.Text className="valid-icon">
                      <FaCheckCircle color="green" />
                    </InputGroup.Text>
                  )}
                </InputGroup>
                {touched.identifier && errors.identifier && (
                  <div className="text-danger small mt-1">{errors.identifier}</div>
                )}
              </Form.Group>

              {/* Password */}
              <Form.Group className="mb-3 position-relative">
                <Form.Label>Password</Form.Label>
                <InputGroup className="position-relative">
                  <InputGroup.Text><FaLock /></InputGroup.Text>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                    isInvalid={!!errors.password}
                    isValid={valid.password && !errors.password}
                  />
                  {valid.password && !errors.password && <FaCheckCircle className="valid-icon-inside" />}
                  <InputGroup.Text
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ cursor: "pointer", zIndex: 3 }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </InputGroup.Text>
                </InputGroup>
                {errors.password && (
                  <div className="text-danger small mt-1">{errors.password}</div>
                )}
              </Form.Group>

              <Button className="btn-signin w-100 mb-3" onClick={handleLogin}>
                Log In
              </Button>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <Link to="/register">New User? Register</Link>
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>

              {/* Social login */}
              <div className="text-center">
                <p className="mb-2">Or login with</p>
                <div className="d-flex justify-content-center gap-3">
                  <button type="button" className="btn-icon google" onClick={() => handleSocialLogin("google")}>
                    <FaGoogle size={20} />
                  </button>
                  <button type="button" className="btn-icon facebook" onClick={() => handleSocialLogin("facebook")}>
                    <FaFacebook size={20} />
                  </button>
                  <button type="button" className="btn-icon twitter" onClick={() => handleSocialLogin("twitter")}>
                    <FaTwitter size={20} />
                  </button>
                </div>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>

      <footer className="login-footer">Copyright © Rudra V 1.1.7</footer>
    </Container>
  );
}
