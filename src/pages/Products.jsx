// Products.jsx
import React, { useEffect, useState } from "react";
import { Card, Button, Row, Col, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Products = ({ addToCart, setUserAddress }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch products from Flask backend
  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, []);

  const handleOrderNow = (product) => {
    addToCart(product);
    setUserAddress({ address: "", distanceKm: 0 });
    navigate("/cart");
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    alert(`${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="danger" />
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <Row className="mt-3">
      {products.map((product) => (
        <Col key={product.id} md={3} className="mb-4">
          <Card className="h-100 text-center shadow-sm">
            <Card.Img
              variant="top"
              src={product.image || "https://via.placeholder.com/200"}
              style={{ height: "200px", objectFit: "cover" }}
            />
            <Card.Body>
              <Card.Title>{product.name}</Card.Title>
              <Card.Text>₹{product.price}</Card.Text>

              {/* Vertical buttons */}
              <div className="d-flex flex-column gap-2">
                <Button
                  variant="success"
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleOrderNow(product)}
                >
                  Order Now
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default Products;
