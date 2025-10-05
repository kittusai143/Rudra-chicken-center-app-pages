// VerifyOtp.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Form, Button } from "react-bootstrap";

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const identifier = params.get("identifier"); // ✅ use identifier (email/phone)

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleVerify = async () => {
    if (!otp) {
      setError("OTP is required");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, otp }), // ✅ send identifier
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ OTP verified");
        navigate(`/reset-password?identifier=${identifier}`); // ✅ pass identifier forward
      } else {
        setError(data.error || "❌ Invalid OTP");
      }
    } catch (err) {
      setError("⚠️ Server error");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <Card className="p-4" style={{ width: "350px" }}>
        <h5 className="mb-3 text-center">Verify OTP</h5>
        <Form.Group className="mb-3">
          <Form.Label>Enter OTP sent to {identifier}</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            isInvalid={!!error}
          />
          <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
        </Form.Group>
        <Button className="w-100" onClick={handleVerify}>
          Verify OTP
        </Button>
      </Card>
    </div>
  );
}
