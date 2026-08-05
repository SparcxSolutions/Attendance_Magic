import { useState } from "react";
import axios from "axios";
import FacultyDashboard from "./components/FacultyDashboard";

function App() {
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState("");

  const [department, setDepartment] = useState("");
  const [section, setSection] = useState("");
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");

  const [attendanceDone, setAttendanceDone] = useState(false);

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
      },
      (error) => {
        console.log(error);
        setMessage("Location Access Denied");
      }
    );
  };

  const submitAttendance = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/mark-attendance/",
        {
          department,
          section,
          name,
          roll_number: rollNumber,
        }
      );

      if (response.data.message === "Attendance Marked") {
        setAttendanceDone(true);
        setMessage("");
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Attendance Failed"
      );
    }
  };

  return (
    <div>
      <h1>Attendance Magic</h1>

      {!verified && (
        <button onClick={verifyLocation}>
          Verify Location
        </button>
      )}

      <h3>{message}</h3>

      {verified && !attendanceDone && (
        <div>
          <h2>Attendance Form</h2>

          <br />

          <select
            value={department}
            onChange={(e) =>
              setDepartment(e.target.value)
            }
          >
            <option value="">
              Select Department
            </option>
            <option value="CSE">CSE</option>
            <option value="CSD">CSD</option>
            <option value="ECE">ECE</option>
          </select>

          <br />
          <br />

          <select
            value={section}
            onChange={(e) =>
              setSection(e.target.value)
            }
          >
            <option value="">
              Select Section
            </option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>

          <br />
          <br />

          <input
            type="text"
            placeholder="Enter Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />

          <br />
          <br />

          <input
            type="text"
            placeholder="Enter Roll Number"
            value={rollNumber}
            onChange={(e) =>
              setRollNumber(e.target.value)
            }
          />

          <br />
          <br />

          <button onClick={submitAttendance}>
            Submit Attendance
          </button>
        </div>
      )}

      {attendanceDone && (
        <div>
          <h2>
            ✅ Attendance Marked Successfully
          </h2>

          <p>
            <strong>Name:</strong> {name}
          </p>

          <p>
            <strong>Roll Number:</strong>{" "}
            {rollNumber}
          </p>

          <p>
            <strong>Department:</strong>{" "}
            {department}
          </p>

          <p>
            <strong>Section:</strong> {section}
          </p>

          <h3>Thank You 🎉</h3>
        </div>
      )}
    </div>
  );
}

export default App;