import { useState } from "react";
import axios from "axios";
const [department, setDepartment] = useState("");
const [section, setSection] = useState("");
const [name, setName] = useState("");
const [rollNumber, setRollNumber] = useState("");
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
  console.log("FULL ERROR:", error);

  if (error.response) {
    console.log("RESPONSE:", error.response.data);
    setMessage(error.response.data.message);
  } else {
    setMessage("Verification Failed");
  }
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

    <br />

    <select>
      <option>Select Department</option>
      <option>CSE</option>
      <option>CSD</option>
      <option>ECE</option>
    </select>

    <br /><br />

    <select>
      <option>Select Section</option>
      <option>A</option>
      <option>B</option>
      <option>C</option>
      <option>D</option>
    </select>

    <br /><br />

    <input
      type="text"
      placeholder="Enter Name"
    />

    <br /><br />

    <input
      type="text"
      placeholder="Enter Roll Number"
    />

    <br /><br />

    <button>
      Submit Attendance
    </button>
  </div>
)}
    </div>
  );
}

export default App;