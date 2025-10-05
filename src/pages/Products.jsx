import React, { useEffect, useState } from "react";
import { Card, Button, Row, Col, Container, Dropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const Products = ({ addToCart }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data); // show all initially
      })
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  const handleFilterByPrice = (range) => {
    let filtered = [...products];
    switch (range) {
      case "0-100":
        filtered = filtered.filter((p) => p.price >= 0 && p.price <= 100);
        break;
      case "101-500":
        filtered = filtered.filter((p) => p.price >= 101 && p.price <= 500);
        break;
      case "501-1000":
        filtered = filtered.filter((p) => p.price >= 501 && p.price <= 1000);
        break;
      case "1001":
        filtered = filtered.filter((p) => p.price >= 1001);
        break;
      default:
        filtered = [...products];
    }
    setFilteredProducts(filtered);
  };

  const handleOrderNow = (product) => {
    addToCart(product); // add item to cart
    navigate("/cart"); // navigate to cart page for checkout
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary">Products</h2>

        {/* Price Filter Icon Only */}
        <Dropdown>
          <Dropdown.Toggle
            variant="light"
            id="dropdown-price-filter"
            style={{ border: "none", background: "transparent" }}
          >
            <FontAwesomeIcon icon={faFilter} size="lg" className="text-secondary" />
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => handleFilterByPrice("0-100")}>₹0 - ₹100</Dropdown.Item>
            <Dropdown.Item onClick={() => handleFilterByPrice("101-500")}>₹101 - ₹500</Dropdown.Item>
            <Dropdown.Item onClick={() => handleFilterByPrice("501-1000")}>₹501 - ₹1000</Dropdown.Item>
            <Dropdown.Item onClick={() => handleFilterByPrice("1001")}>₹1001 & above</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => handleFilterByPrice("all")}>Show All</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <Row className="g-3">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <Col key={product.id} xs={12} sm={6} md={4} lg={3}>
              <Card className="h-100 shadow-sm d-flex flex-column">
                <Card.Img
                  variant="top"
                  src={product.image || "https://via.placeholder.com/150"}
                  style={{ height: "150px", objectFit: "cover" }}
                />
                <Card.Body className="d-flex flex-column justify-content-between">
                  <div>
                    <Card.Title>{product.name}</Card.Title>
                    <Card.Text>Category: {product.category}</Card.Text>
                    <Card.Text>Price: ₹{product.price}</Card.Text>
                  </div>

                  <div className="d-flex flex-column gap-2 mt-3">
                    {/* Add to Cart Button */}
                    <Button
                      variant="success"
                      size="lg"
                      className="w-100"
                      onClick={() => addToCart(product)}
                    >
                      Add to Cart
                    </Button>

                    {/* Order Now Button */}
                    <Button
                      variant="danger"
                      size="lg"
                      className="w-100"
                      onClick={() => handleOrderNow(product)}
                    >
                      Order Now
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <p className="text-center text-muted">No products available in this range.</p>
        )}
      </Row>
    </Container>
  );
};

export default Products;
