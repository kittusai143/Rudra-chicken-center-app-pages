import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  InputGroup,
  Button,
} from "react-bootstrap";
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaTelegram,
  FaCheckCircle,
  FaGoogle,
  FaTwitter,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import Rudra from "./Rudra-chicken-center/Rudra.jpeg";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Login({ onLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [errors, setErrors] = useState({ identifier: "", password: "" });
  const [valid, setValid] = useState({ identifier: false, password: false });
  const [touched, setTouched] = useState({ identifier: false, password: false });

  const navigate = useNavigate();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10}$/;

  // ✅ Check if already logged in (normal or social)
  useEffect(() => {
    const social = localStorage.getItem("socialLogin");
    const normalUser = localStorage.getItem("loggedInUser");
    if (social || normalUser) {
      navigate("/orders");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
    setErrors((s) => ({ ...s, [name]: "" }));

    if (name === "identifier")
      setValid((s) => ({
        ...s,
        identifier: emailRegex.test(value) || phoneRegex.test(value),
      }));
    if (name === "password")
      setValid((s) => ({ ...s, password: value.trim().length >= 6 }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((s) => ({ ...s, [name]: true }));
  };

  const handleLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setTouched({ identifier: true, password: true });

    const newErrors = {};
    if (!formData.identifier.trim()) newErrors.identifier = "This field is required";
    else if (!emailRegex.test(formData.identifier) && !phoneRegex.test(formData.identifier))
      newErrors.identifier = "Enter a valid email or phone";

    if (!formData.password.trim()) newErrors.password = "This field is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
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
        alert(data.message || "✅ Login successful!");
        localStorage.setItem(
          "loggedInUser",
          JSON.stringify(data.user || { identifier: formData.identifier })
        );
        onLogin?.();
        navigate("/orders");
      } else {
        alert(`❌ ${data.error || "Invalid credentials"}`);
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("❌ Server not responding. Please try again later.");
    }
  };

  // ====================== Social Login Fix ======================
  const openSocialPopup = (url, platform) => {
  const width = 600;
  const height = 700;
  const left = window.screenX + (window.innerWidth - width) / 2;
  const top = window.screenY + (window.innerHeight - height) / 2;

  const popup = window.open(
    url,
    `${platform}-login`,
    `width=${width},height=${height},top=${top},left=${left}`
  );

  if (!popup) {
    alert("❌ Popup blocked! Please allow popups for this site.");
    return;
  }

  // ✅ Remove blocking alert
  console.log(`Please log in to ${platform} in the popup window.`);

  const checkClosed = setInterval(() => {
    if (!popup || popup.closed) {
      clearInterval(checkClosed);

      // ✅ Simulate successful login
      localStorage.setItem("socialLogin", platform);
      onLogin?.(); // update App.jsx state

      navigate("/orders"); // redirect to dashboard
    }
  }, 500); // check every 0.5 sec
};

  return (
    <Container
      fluid
      className="login-bg d-flex flex-column justify-content-center align-items-center"
    >
      <div className="text-center mb-4">
        <img src={Rudra} alt="Chicken" className="chicken-img" />
        <h1 className="login-title">Rudra Chicken Center</h1>
      </div>

      <Row className="justify-content-center w-100">
        <Col xs={11} sm={8} md={5} lg={4}>
          <Card className="login-card p-4">
            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3 position-relative">
                <Form.Label>Email or Phone</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FaUser />
                  </InputGroup.Text>
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

              <Form.Group className="mb-3 position-relative">
                <Form.Label>Password</Form.Label>
                <InputGroup className="position-relative">
                  <InputGroup.Text>
                    <FaLock />
                  </InputGroup.Text>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={!!errors.password}
                    isValid={valid.password && !errors.password}
                  />
                  {valid.password && !errors.password && (
                    <FaCheckCircle className="valid-icon-inside" />
                  )}
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

              <Button className="btn-signin w-100 mb-3" type="submit">
                Log In
              </Button>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <Link to="/register">New User? Register</Link>
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>

              <div className="text-center">
                <p className="mb-2">Or login with</p>
                <div className="d-flex justify-content-center gap-3">
                  <button
                    type="button"
                    className="btn-icon google"
                    onClick={() =>
                      openSocialPopup("https://accounts.google.com/signin", "Google")
                    }
                  >
                    <FaGoogle size={20} />
                  </button>
                  <button
                    type="button"
                    className="btn-icon telegram"
                    onClick={() =>
                      openSocialPopup("https://web.telegram.org/k/", "Telegram")
                    }
                  >
                    <FaTelegram size={25} />
                  </button>
                  <button
                    type="button"
                    className="btn-icon twitter"
                    onClick={() =>
                      openSocialPopup("https://twitter.com/login", "Twitter")
                    }
                  >
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
