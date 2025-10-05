import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";

const MapView = () => {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);

  // Map container style
  const containerStyle = {
    width: "100%",
    height: "600px",
  };

  // Default center (example: Hyderabad)
  const center = {
    lat: 17.385044,
    lng: 78.486671,
  };

  // Function to geocode address to lat/lng using Google Maps Geocoding API
  const geocodeAddress = async (address) => {
    const apiKey = "YOUR_GOOGLE_MAPS_API_KEY";
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
      );
      const data = await res.json();
      if (data.results && data.results[0]) {
        return data.results[0].geometry.location; // { lat, lng }
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/orders");
        const data = await res.json();

        // Add lat/lng to each order
        const ordersWithLatLng = await Promise.all(
          data.map(async (order) => {
            const location = await geocodeAddress(order.customerAddress);
            return { ...order, ...location };
          })
        );

        setOrders(ordersWithLatLng);
      } catch (err) {
        console.error(err);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="my-4">
      <h2 className="text-center mb-3">🗺️ Delivery Locations</h2>
      <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={6}>
          {orders.map((order) =>
            order.lat && order.lng ? (
              <Marker
                key={order.id}
                position={{ lat: order.lat, lng: order.lng }}
                onClick={() => setSelected(order)}
              />
            ) : null
          )}

          {selected && (
            <InfoWindow
              position={{ lat: selected.lat, lng: selected.lng }}
              onCloseClick={() => setSelected(null)}
            >
              <div>
                <h6>{selected.customerName}</h6>
                <p>ID: {selected.id}</p>
                <p>Address: {selected.customerAddress}</p>
                <p>KGs: {selected.kgs}</p>
                <p>Product: {selected.productName}</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default MapView;
