import React from "react";
import { Navbar, Form, FormControl } from "react-bootstrap";

export default function Header() {
  return (
    <Navbar bg="light" expand="lg" className="px-3 border-bottom">
      <Form className="d-flex flex-grow-1">
        <FormControl type="search" placeholder="Search by User, Store & Order" className="me-2" />
      </Form>
      <img
        src="https://i.pravatar.cc/40"
        alt="profile"
        className="rounded-circle"
        width="40"
        height="40"
      />
    </Navbar>
  );
}
