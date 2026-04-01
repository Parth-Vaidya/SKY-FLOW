export default function FlightDetails({ flight, onClose }) {
  if (!flight) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        right: 20,
        width: "280px",
        background: "white",
        padding: "15px",
        borderRadius: "10px",
        boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
        zIndex: 9999,

        // ✅ THIS IS IMPORTANT
        pointerEvents: "auto",
      }}
    >
      <h3 style={{ margin: 0 }}>✈ Flight Details</h3>

      <p><b>Callsign:</b> {flight.callsign}</p>
      <p><b>ICAO24:</b> {flight.icao24}</p>

      <button
        onClick={onClose}
        style={{
          width: "100%",
          padding: "8px",
          border: "none",
          background: "red",
          color: "white",
          cursor: "pointer",
          borderRadius: "6px",
        }}
      >
        Close
      </button>
    </div>
  );
}
