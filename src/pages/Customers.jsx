import React, { useEffect, useState } from "react";
import { Table, Container } from "react-bootstrap";

const Customers = () => {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/customers")
      .then(res => res.json())
      .then(data => setCustomers(data));
  }, []);

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">👤 Customers</h2>
      <Table bordered hover>
        <thead className="table-warning">
          <tr>
           <th>ID</th>
           <th>Name</th>
           <th>Address</th>
           <th>Phone</th>
           <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(c => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>{c.address}</td>
              <td>{c.phone}</td>
              <td>{c.email}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Customers;
