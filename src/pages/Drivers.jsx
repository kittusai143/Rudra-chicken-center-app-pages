import React, { useEffect, useState } from "react";
import { Table, Container, Form } from "react-bootstrap";

const Drivers = () => {
  const [orders, setOrders] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [products] = useState(["Chicken"]);

  // Dummy drivers
  const drivers = [
    { id: 1, name: "Ramesh" },
    { id: 2, name: "Suresh" },
    { id: 3, name: "Mahesh" },
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/orders");
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchOrders();
  }, []);

  const handleDriverChange = (orderId, value) => {
    setAssignments({
      ...assignments,
      [orderId]: { ...assignments[orderId], driver: value },
    });
  };

  const handleProductChange = (orderId, value) => {
    setAssignments({
      ...assignments,
      [orderId]: { ...assignments[orderId], product: value },
    });
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">🚚 Assign Drivers</h2>
      <Table bordered hover responsive>
        <thead className="table-success">
          <tr>
            <th>ID</th>
            <th>Customer Name</th>
            <th>Address</th>
            <th>KGs</th>
            <th>Driver Name</th>
            <th>Product</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.customerName}</td>
              <td>{o.customerAddress}</td>
              <td>{o.kgs}</td>
              <td>
                <Form.Select
                  value={assignments[o.id]?.driver || ""}
                  onChange={(e) => handleDriverChange(o.id, e.target.value)}
                >
                  <option value="">Select Driver</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </Form.Select>
              </td>
              <td>
                <Form.Select
                  value={assignments[o.id]?.product || o.productName}
                  onChange={(e) => handleProductChange(o.id, e.target.value)}
                >
                  {products.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Form.Select>
              </td>
              <td>₹{o.price}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Drivers;
