import { useState } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");

  const startAttendance = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await axios.post(
            "http://127.0.0.1:8000/api/start-session/",
            {
              department: "CSE",
              section: "A",
              faculty_latitude: position.coords.latitude,
              faculty_longitude: position.coords.longitude,
            }
          );

          setMessage(response.data.message);

        } catch (error) {
          console.log(error);
        }
      },
      (error) => {
        console.log(error);
      }
    );
  };

  return (
    <div>
      <h1>Attendance Magic</h1>

      <button onClick={startAttendance}>
        Start Attendance
      </button>

      <h2>{message}</h2>
    </div>
  );
}

export default App;