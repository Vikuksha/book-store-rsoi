import React from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const Map = () => {
  const mapStyles = {
    height: "400px",
    width: "100%",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    margin: "20px 0",
  };

  return (
    <div
      style={{
        maxWidth: "1500px",
        maxHeight: "700",
        margin: "10px auto",
        padding: "20px",
        textAlign: "center",
        height: "auto",
        marginBottom: "60px",
      }}
    >
      <h2
        style={{
          marginBottom: "10px",
          color: "#000",
          fontSize: "32px",
          fontWeight: "bold",
          textTransform: "uppercase",
        }}
      >
        Our Address
      </h2>
      <div className="map_area">
        <iframe
          style={{ marginTop: "20px" }}
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3162.923282295345!2d126.97796901568177!3d37.566535679798265!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357ca2eb0f292b9b%3A0x9c2b7efde1ca5c84!2sSeoul%2C%20South%20Korea!5e0!3m2!1sen!2skr!4v1714222718294!5m2!1sen!2skr"
            width="1320"
            height="500"
            referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  );
};

export default Map;
