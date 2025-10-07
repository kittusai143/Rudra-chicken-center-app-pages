// Products.jsx
import React, { useEffect, useState } from "react";
import { Card, Button, Row, Col, Spinner, Dropdown, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaFilter } from "react-icons/fa";

const Products = ({ addToCart, setUserAddress }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const navigate = useNavigate();

  // Fetch products from Flask backend
  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, []);

  // Filter products based on price range
  const filterByPrice = (filter) => {
    setSelectedFilter(filter);

    if (filter === "all") {
      setFilteredProducts(products);
      return;
    }

    let filtered = [];
    if (filter === "low") {
      filtered = products.filter((p) => p.price < 100);
    } else if (filter === "medium") {
      filtered = products.filter((p) => p.price >= 100 && p.price <= 500);
    } else if (filter === "high") {
      filtered = products.filter((p) => p.price > 500);
    }
    setFilteredProducts(filtered);
  };

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
    <Container>
      {/* Filter Icon Section */}
      <div className="d-flex justify-content-end align-items-center mt-3 mb-3">
        <Dropdown align="end">
          <Dropdown.Toggle variant="outline-dark" id="filter-icon" className="d-flex align-items-center">
            <FaFilter />
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => filterByPrice("all")}>
              All Products
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => filterByPrice("low")}>
              Below ₹100
            </Dropdown.Item>
            <Dropdown.Item onClick={() => filterByPrice("medium")}>
              ₹100 - ₹500
            </Dropdown.Item>
            <Dropdown.Item onClick={() => filterByPrice("high")}>
              Above ₹500
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {/* Products Display */}
      <Row>
        {filteredProducts.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <h5>No products found for this filter.</h5>
          </div>
        ) : (
          filteredProducts.map((product) => (
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
          ))
        )}
      </Row>
    </Container>
  );
};

export default Products;
