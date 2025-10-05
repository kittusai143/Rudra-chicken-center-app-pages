import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, Button, Card, InputGroup } from "react-bootstrap";
import { FaEye, FaEyeSlash, FaKey, FaCheckCircle, FaLock } from "react-icons/fa";
import "./ResetPassword.css";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);

  // ✅ use "identifier" for both phone/email
  const identifier = params.get("identifier");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({ newPassword: "", confirmPassword: "" });
  const [submitted, setSubmitted] = useState(false);

  const validateNewPassword = (password) => {
    if (!password) return "This field is required";
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password)
      ? ""
      : "Password must be 8+ chars, include uppercase, lowercase, number & special char";
  };

  const validateConfirmPassword = (password, confirm) => {
    if (!confirm) return "This field is required";
    return password === confirm ? "" : "Passwords do not match";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    const newPassError = validateNewPassword(newPassword);
    const confirmPassError = validateConfirmPassword(newPassword, confirmPassword);

    setErrors({ newPassword: newPassError, confirmPassword: confirmPassError });

    if (newPassError || confirmPassError) return;

    try {
      const response = await fetch("http://localhost:5000/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, newPassword }), // ✅ send identifier
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        navigate("/login");
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("⚠️ Something went wrong. Try again.");
    }
  };

  return (
    <div className="reset-wrapper">
      <Card className="reset-box shadow">
        <div className="icon-circle">
          <FaKey size={60} color="white" />
        </div>

        <Card.Body>
          <h2 className="text-center reset-title">Reset Password</h2>

          <Form onSubmit={handleSubmit} noValidate>
            {/* New Password */}
            <Form.Group className="mb-3 position-relative">
              <Form.Label>New Password</Form.Label>
              <InputGroup hasValidation>
                <InputGroup.Text>
                  <FaLock />
                </InputGroup.Text>
                <Form.Control
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (submitted) {
                      setErrors((prev) => ({
                        ...prev,
                        newPassword: validateNewPassword(e.target.value),
                      }));
                    }
                  }}
                  placeholder="Enter new password"
                  isInvalid={submitted && !!errors.newPassword}
                  isValid={submitted && newPassword && !errors.newPassword}
                  required
                />
                <InputGroup.Text
                  className="icon-btn"
                  onClick={() => setShowNew(!showNew)}
                >
                  {showNew ? <FaEyeSlash /> : <FaEye />}
                </InputGroup.Text>
                {submitted && newPassword && !errors.newPassword && (
                  <span className="valid-tick">
                    <FaCheckCircle />
                  </span>
                )}
                <Form.Control.Feedback type="invalid">
                  {errors.newPassword}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            {/* Confirm Password */}
            <Form.Group className="mb-3 position-relative">
              <Form.Label>Confirm New Password</Form.Label>
              <InputGroup hasValidation>
                <InputGroup.Text>
                  <FaLock />
                </InputGroup.Text>
                <Form.Control
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (submitted) {
                      setErrors((prev) => ({
                        ...prev,
                        confirmPassword: validateConfirmPassword(
                          newPassword,
                          e.target.value
                        ),
                      }));
                    }
                  }}
                  placeholder="Enter confirm password"
                  isInvalid={submitted && !!errors.confirmPassword}
                  isValid={submitted && confirmPassword && !errors.confirmPassword}
                  required
                />
                <InputGroup.Text
                  className="icon-btn"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </InputGroup.Text>
                {submitted && confirmPassword && !errors.confirmPassword && (
                  <span className="valid-tick">
                    <FaCheckCircle />
                  </span>
                )}
                <Form.Control.Feedback type="invalid">
                  {errors.confirmPassword}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            <div className="d-flex justify-content-between">
              <Button type="submit" variant="primary">
                Continue
              </Button>
              <Button
                variant="link"
                className="cancel-btn"
                onClick={() => navigate("/login")}
              >
                Cancel
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
