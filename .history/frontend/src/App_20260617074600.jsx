import { useState } from "react";
import axios from "axios";

function App() {
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState("");

  const verifyLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await axios.post(
            "http://127.0.0.1:8000/api/verify-location/",
            {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }
          );

          if (response.data.verified) {
            setVerified(true);
            setMessage("Location Verified ✅");
          } else {
            setMessage("Outside Allowed Area ❌");
          }
        } catch (error) {
          console.log(error);
          setMessage("Verification Failed");
        }
      }
    );
  };

  return (
    <div>
      <h1>Attendance Magic</h1>

      <button onClick={verifyLocation}>
        Verify Location
      </button>

      <h3>{message}</h3>

      {verified && (
        <div>
          <h2>Attendance Form</h2>
        </div>
      )}
    </div>
  );
}

export default App;