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
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    customer: "",
    product: "",
    rating: 0,
    comment: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetch("http://localhost:5000/api/reviews")
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch((err) => console.error("Failed to load reviews", err));
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!newReview.customer.trim())
      newErrors.customer = "Customer name is required";
    if (!newReview.product.trim())
      newErrors.product = "Product name is required";
    if (newReview.rating === 0) newErrors.rating = "Rating is required";
    if (!newReview.comment.trim())
      newErrors.comment = "Feedback comment is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const res = await fetch("http://localhost:5000/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReview),
    });

    const data = await res.json();
    if (res.ok) {
      setReviews([...reviews, newReview]);
      setNewReview({ customer: "", product: "", rating: 0, comment: "" });
      setErrors({});
      alert("✅ Thank you for your feedback!");
    } else {
      alert(data.error || "Failed to submit review");
    }
  };

  // ⭐ Handle half-star click logic
  const handleStarClick = (event, index) => {
    const { left, width } = event.target.getBoundingClientRect();
    const clickX = event.clientX - left;
    const clickedHalf = clickX < width / 2 ? 0.5 : 1;
    const newRating = index + clickedHalf;
    setNewReview({ ...newReview, rating: newRating });
    setErrors({ ...errors, rating: "" });
  };

  // ⭐ Render stars including halves
  const renderStars = (rating, starSize = 30) => {
    return [1, 2, 3, 4, 5].map((i) => {
      if (rating >= i) return <FaStar key={i} size={starSize} color="gold" />;
      else if (rating >= i - 0.5)
        return <FaStarHalfAlt key={i} size={starSize} color="gold" />;
      else return <FaRegStar key={i} size={starSize} color="lightgray" />;
    });
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center text-danger">⭐ Customer Feedback</h2>

      {/* Review Form */}
      <Card className="p-3 shadow-sm mb-4">
        <Form onSubmit={handleSubmit}>
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
                  isInvalid={!!errors.customer}
                />
                {errors.customer && (
                  <Form.Text className="text-danger small">
                    {errors.customer}
                  </Form.Text>
                )}
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
                  isInvalid={!!errors.product}
                />
                {errors.product && (
                  <Form.Text className="text-danger small">
                    {errors.product}
                  </Form.Text>
                )}
              </Form.Group>
            </Col>
          </Row>

          {/* ⭐ Rating */}
          <Form.Group className="mb-2">
            <Form.Label className="small fw-semibold">Rate the Product</Form.Label>
            <div>
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  style={{ cursor: "pointer", marginRight: "5px" }}
                  onClick={(e) => handleStarClick(e, i)}
                >
                  {renderStars(newReview.rating)[i]}
                </span>
              ))}
            </div>
            {errors.rating && (
              <Form.Text className="text-danger small">{errors.rating}</Form.Text>
            )}
          </Form.Group>

          {/* Feedback */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="comment">
                <Form.Label className="small fw-semibold">Feedback</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Write your experience..."
                  value={newReview.comment}
                  onChange={(e) =>
                    setNewReview({ ...newReview, comment: e.target.value })
                  }
                  isInvalid={!!errors.comment}
                  size="sm"
                  style={{ fontSize: "0.85rem", padding: "6px 8px" }}
                />
                {errors.comment && (
                  <Form.Text className="text-danger small">
                    {errors.comment}
                  </Form.Text>
                )}
              </Form.Group>
            </Col>
          </Row>

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
              <span>{renderStars(r.rating)}</span>
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
