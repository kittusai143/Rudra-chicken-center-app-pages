import React, { useEffect, useState } from "react";
import {
  Container,
  Form,
  Button,
  ListGroup,
  Row,
  Col,
  Card,
} from "react-bootstrap";
import { FaStar } from "react-icons/fa";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    customer: "",
    product: "",
    rating: 0,
    comment: "",
  });

  useEffect(() => {
    fetch("http://localhost:5000/api/reviews")
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch((err) => console.error("Failed to load reviews", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.customer || !newReview.product || !newReview.rating) {
      alert("Please fill all required fields!");
      return;
    }

    const res = await fetch("http://localhost:5000/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReview),
    });

    const data = await res.json();
    if (res.ok) {
      setReviews([...reviews, newReview]);
      setNewReview({ customer: "", product: "", rating: 0, comment: "" });
      alert("✅ Thank you for your feedback!");
    } else {
      alert(data.error || "Failed to submit review");
    }
  };

  const handleStarClick = (rating) => {
    setNewReview({ ...newReview, rating });
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center text-danger">⭐ Customer Feedback</h2>

      {/* Review Form */}
      <Card className="p-3 shadow-sm mb-4">
        <Form onSubmit={handleSubmit}>
          {/* Two inputs per row */}
          <Row className="mb-2">
            <Col md={6}>
              <Form.Group controlId="customer">
                <Form.Label className="small fw-semibold">Customer</Form.Label>
                <Form.Control
                  size="sm"
                  type="text"
                  placeholder="Your name"
                  value={newReview.customer}
                  onChange={(e) =>
                    setNewReview({ ...newReview, customer: e.target.value })
                  }
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="product">
                <Form.Label className="small fw-semibold">Product</Form.Label>
                <Form.Control
                  size="sm"
                  type="text"
                  placeholder="Product name"
                  value={newReview.product}
                  onChange={(e) =>
                    setNewReview({ ...newReview, product: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Rating Stars */}
          <Form.Group className="mb-2">
            <Form.Label className="small fw-semibold">Rate the Product</Form.Label>
            <div>
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  size={20}
                  onClick={() => handleStarClick(star)}
                  style={{
                    cursor: "pointer",
                    color: newReview.rating >= star ? "gold" : "lightgray",
                    marginRight: "4px",
                  }}
                />
              ))}
            </div>
          </Form.Group>

          <Row className="mb-3">
              <Col md={6}> {/* smaller width column */}
                <Form.Group controlId="comment">
                  <Form.Label className="small fw-semibold">Feedback</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3} // keeps it a proper textarea
                    placeholder="Write your experience..."
                    value={newReview.comment}
                    onChange={(e) =>
                      setNewReview({ ...newReview, comment: e.target.value })
                    }
                    size="sm"
                    style={{ fontSize: "0.85rem", padding: "6px 8px" }}
                  />
                </Form.Group>
              </Col>
            </Row>
            
          {/* Submit button aligned to right */}
          <div className="d-flex justify-content-end">
            <Button size="sm" variant="success" type="submit">
              Submit
            </Button>
          </div>
        </Form>
      </Card>

      {/* Display Reviews */}
      <h5 className="mb-3 text-center text-primary">📝 Recent Reviews</h5>
      <ListGroup>
        {reviews.length === 0 && (
          <ListGroup.Item className="text-center small">
            No reviews yet. Be the first!
          </ListGroup.Item>
        )}

        {reviews.map((r, idx) => (
          <ListGroup.Item key={idx} className="mb-2 shadow-sm rounded p-2">
            <div className="d-flex justify-content-between align-items-center">
              <strong className="small">{r.customer}</strong>
              <span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    size={16}
                    color={r.rating >= star ? "gold" : "lightgray"}
                  />
                ))}
              </span>
            </div>
            <div className="text-muted small">
              <em>{r.product}</em>
            </div>
            <p className="mt-1 mb-0 small">{r.comment}</p>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
  );
};

export default Reviews;
