import Navbar from "../components/Navbar";
import StatsCard from "../components/StatsCard";
import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import SessionForm from "../components/SessionForm";
import AttendanceSummary from "../components/AttendanceSummary";
import StudentTable from "../components/StudentTable";

const INTERNAL_CSS = `
  .fd-wrapper {
    min-height: 100vh;
    background-color: #f1f5f9;
    padding: 2rem;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: #0f172a;
    box-sizing: border-box;
  }

  .fd-title {
    font-size: 1.875rem;
    font-weight: 700;
    margin-bottom: 2rem;
    color: #1e293b;
  }

  .fd-stats-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 1.5rem;
    margin-bottom: 2.5rem;
  }

  @media (min-width: 768px) {
    .fd-stats-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .fd-live-container {
    background-color: #ffffff;
    border-radius: 1rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    padding: 2rem;
    margin-top: 2rem;
    border: 1px solid #e2e8f0;
    animation: fadeIn 0.4s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .fd-live-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .fd-live-details {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .fd-live-text {
    font-size: 1rem;
    color: #334155;
    margin: 0;
  }

  .fd-status-active { color: #16a34a; font-weight: 700; }
  .fd-status-expired { color: #dc2626; font-weight: 700; }
  .fd-time-remaining { color: #1d4ed8; font-weight: 700; font-size: 1.25rem; }

  .fd-label {
    font-weight: 600;
    color: #334155;
    display: block;
    margin-bottom: 0.5rem;
  }

  .fd-input {
    width: 100%;
    border: 1px solid #cbd5e1;
    border-radius: 0.5rem;
    padding: 0.75rem;
    font-size: 1rem;
    background-color: #f8fafc;
    color: #334155;
    box-sizing: border-box;
    transition: border-color 0.2s;
  }

  .fd-input:focus {
    outline: none;
    border-color: #2563eb;
  }

  .fd-actions {
    margin-top: 0.5rem;
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .fd-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 0.75rem;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    border: none;
    transition: background-color 0.2s, transform 0.1s;
    color: #ffffff;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .fd-btn:active { transform: scale(0.98); }
  
  .fd-btn-primary { background-color: #2563eb; }
  .fd-btn-primary:hover { background-color: #1d4ed8; }
  
  .fd-btn-danger { background-color: #dc2626; }
  .fd-btn-danger:hover { background-color: #b91c1c; }

  .fd-divider {
    margin: 2.5rem 0;
    border: none;
    border-top: 1px solid #e2e8f0;
  }

  .fd-search-container {
    margin: 1.5rem 0;
  }

  .fd-search-input {
    width: 100%;
    border: 1px solid #cbd5e1;
    border-radius: 0.75rem;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    box-sizing: border-box;
    transition: all 0.2s;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }

  .fd-search-input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

function FacultyDashboard() {
  const [summary, setSummary] = useState([]);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const studentTableRef = useRef(null);

  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);

  const [radius, setRadius] = useState(100);
  const [duration, setDuration] = useState(2);
  const [attendanceLink, setAttendanceLink] = useState("");
  const [expiresAt, setExpiresAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [sessionActive, setSessionActive] = useState(false);

  useEffect(() => {
    fetchSummary();
    checkActiveSession();
  }, []);

  const checkActiveSession = async () => {
    try {
      const response = await API.get("active-session/");
      if (response.data && response.data.id) {
        setSessionActive(true);
        setExpiresAt(response.data.expires_at);
        const link = `https://attendance-magic-c8tj.vercel.app/attendance/${response.data.id}`;
        setAttendanceLink(link);
      }
    } catch (error) {
      // No active session found - that's fine
      setSessionActive(false);
    }
  };

  useEffect(() => {
    if (!expiresAt) return;

    const timer = setInterval(() => {
      const now = new Date();
      const end = new Date(expiresAt);
      const diff = end - now;

      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft("00:00");
        setSessionActive(false);
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      setTimeLeft(
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  const fetchSummary = async () => {
    try {
      const response = await API.get("attendance-summary/");
      setSummary(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchStudents = async (department, section, shouldScroll = false) => {
    setSelectedDepartment(department);
    setSelectedSection(section);

    try {
      const response = await API.get(
        `attendance-list/?department=${department}&section=${section}`
      );
      setStudents(response.data);

      if (shouldScroll) {
        setTimeout(() => {
          studentTableRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }, 100);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchSummary();
      if (selectedDepartment && selectedSection) {
        fetchStudents(selectedDepartment, selectedSection, false);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedDepartment, selectedSection]);

  const startSession = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const createSession = async () => {
          const response = await API.post("start-session/", {
            faculty_latitude: position.coords.latitude,
            faculty_longitude: position.coords.longitude,
            radius,
            duration_minutes: duration
          });

          console.log(
            "Faculty Location:",
            position.coords.latitude,
            position.coords.longitude
          );

          setAttendanceLink(response.data.attendance_link);
          setExpiresAt(response.data.data.expires_at);
          setSessionActive(true);
          alert("Attendance Session Started");
          fetchSummary();
        };

        try {
          await createSession();
        } catch (error) {
          const msg = error.response?.data?.message || "";
          if (msg.toLowerCase().includes("already active")) {
            checkActiveSession();
            alert("An attendance session is already active.");
          } else {
            const errorMsg =
              msg ||
              error.response?.data?.detail ||
              JSON.stringify(error.response?.data) ||
              "Unknown error. Please check your connection.";
            alert("Unable to Start Session: " + errorMsg);
          }
        }
      },
      (error) => {
        alert("Please allow location access: " + error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const endSession = async () => {
    try {
      await API.post("end-session/");
      setSessionActive(false);
      setAttendanceLink("");
      setExpiresAt(null);
      setTimeLeft("");
      fetchSummary();
      alert("Attendance Session Ended");
    } catch (error) {
      console.log(error);
      alert("Unable to End Session");
    }
  };

  const groupedSummary = {};
  summary.forEach((item) => {
    const date = item.attendance_date;
    if (!groupedSummary[date]) {
      groupedSummary[date] = [];
    }
    groupedSummary[date].push(item);
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: INTERNAL_CSS }} />

      <div className="fd-wrapper">
        <Navbar />

        <h1 className="fd-title">Welcome Back 👋</h1>

        <div className="fd-stats-grid">
          <StatsCard
            title="Today's Sessions"
            value={sessionActive ? 1 : 0}
            color="bg-blue-600"
          />
          <StatsCard
            title="Present Students"
            value={summary.reduce((total, item) => total + item.student_count, 0)}
            color="bg-green-600"
          />
          <StatsCard
            title="Status"
            value={sessionActive ? "Active" : "Inactive"}
            color="bg-purple-600"
          />
        </div>

        {!sessionActive && (
          <SessionForm
            radius={radius}
            duration={duration}
            setRadius={setRadius}
            setDuration={setDuration}
            startSession={startSession}
          />
        )}

        {attendanceLink && (
          <div className="fd-live-container">
            <h2 className="fd-live-title">🟢 Live Attendance Session</h2>

            <div className="fd-live-details">
              <p className="fd-live-text">
                <strong>Status :</strong>{" "}
                {sessionActive ? (
                  <span className="fd-status-active">Active</span>
                ) : (
                  <span className="fd-status-expired">Expired</span>
                )}
              </p>

              <p className="fd-live-text">
                <strong>Time Remaining :</strong>{" "}
                <span className="fd-time-remaining">{timeLeft}</span>
              </p>

              <div>
                <label className="fd-label">Attendance Link</label>
                <input
                  className="fd-input"
                  readOnly
                  value={attendanceLink}
                />
              </div>

              <div className="fd-actions">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(attendanceLink);
                    alert("Attendance Link Copied");
                  }}
                  className="fd-btn fd-btn-primary"
                >
                  📋 Copy Attendance Link
                </button>
                <button
                  onClick={endSession}
                  className="fd-btn fd-btn-danger"
                >
                  🛑 End Session
                </button>
              </div>
            </div>
          </div>
        )}

        <hr className="fd-divider" />

        <AttendanceSummary
          groupedSummary={groupedSummary}
          fetchStudents={fetchStudents}
        />

        <div className="fd-search-container">
          <input
            type="text"
            placeholder="🔍 Search by Name or Roll Number"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="fd-search-input"
          />
        </div>

        <div ref={studentTableRef}>
          <StudentTable
            students={students.filter(
              (student) =>
                student.name.toLowerCase().includes(search.toLowerCase()) ||
                student.roll_number.toLowerCase().includes(search.toLowerCase())
            )}
          />
        </div>
      </div>
    </>
  );
}

export default FacultyDashboard;
