import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";

const MapView = () => {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  // Map container style
  const containerStyle = {
    width: "100%",
    height: "600px",
  };

  // Default center (Hyderabad)
  const center = {
    lat: 17.385044,
    lng: 78.486671,
  };

  // Store coordinates (example)
  const STORE_COORDS = { lat: 17.385044, lng: 78.486671 };

  // Function to geocode address using Google Geocoding API
  const geocodeAddress = async (address) => {
    const apiKey = "YOUR_GOOGLE_MAPS_API_KEY"; // 🔹 Replace with your valid key
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${apiKey}`
      );
      const data = await res.json();
      if (data.results && data.results[0]) {
        return data.results[0].geometry.location;
      }
    } catch (err) {
      console.error("Geocode error:", err);
    }
    return null;
  };

  // Get user’s current GPS location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          console.warn("Location access denied, using default center");
          setUserLocation(center);
        }
      );
    } else {
      setUserLocation(center);
    }
  }, []);

  // Fetch orders and geocode addresses
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/orders");
        const data = await res.json();

        const ordersWithCoords = await Promise.all(
          data.map(async (order) => {
            const coords = await geocodeAddress(order.customerAddress);
            return { ...order, ...coords };
          })
        );

        setOrders(ordersWithCoords);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="my-4">
      <h2 className="text-center mb-3">🗺️ Delivery Locations</h2>
      <LoadScript googleMapsApiKey="AIzaSyAOHcP2ewAbubKCTT08dWeFlHZatrfqFcg">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={userLocation || center}
          zoom={userLocation ? 12 : 6}
        >
          {/* Store marker */}
          <Marker position={STORE_COORDS} label="Store" />

          {/* Customer location marker */}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              }}
              label="You"
            />
          )}

          {/* Order markers */}
          {orders.map(
            (order) =>
              order.lat &&
              order.lng && (
                <Marker
                  key={order.id}
                  position={{ lat: order.lat, lng: order.lng }}
                  onClick={() => setSelected(order)}
                />
              )
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
                <p>Product: {selected.productName}</p>
                <p>Quantity: {selected.kgs} KGs</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default MapView;
