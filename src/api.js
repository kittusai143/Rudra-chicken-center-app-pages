import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

export const getOrders = () => API.get("/orders");
export const getCustomers = () => API.get("/customers");
export const getDrivers = () => API.get("/drivers");
export const getStores = () => API.get("/stores");
export const getProducts = () => API.get("/products");
export const getReviews = () => API.get("/reviews");
export const getMapView = () => API.get("/mapview");
