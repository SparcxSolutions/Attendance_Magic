import React, { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";
import { CalendarDays, Users, Activity, Copy, StopCircle, Search } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

// ==========================================
// 1. UNIQUE INLINE CSS (No External Files)
// ==========================================
const DASHBOARD_STYLES = `
  /* Main Dashboard Wrappers */
  .fd-dash-root { min-height: 100vh; background-color: #f8fafc; padding: 1rem; font-family: system-ui, -apple-system, sans-serif; position: relative; overflow-x: hidden; animation: fdFadeIn 0.8s ease-out forwards; }
  @media (min-width: 640px) { .fd-dash-root { padding: 2rem; } }
  @keyframes fdFadeIn { from { opacity: 0; } to { opacity: 1; } }
  .fd-dash-main { position: relative; z-index: 10; max-width: 80rem; margin-left: auto; margin-right: auto; }
  .fd-dash-title { font-size: 32px; font-weight: 800; margin-bottom: 2rem; margin-top: 2.5rem; letter-spacing: -0.025em; color: #111827; }
  @media (min-width: 640px) { .fd-dash-title { font-size: 36px; } }
  .fd-dash-stats-grid { display: grid; grid-template-columns: repeat(1, minmax(0, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
  @media (min-width: 768px) { .fd-dash-stats-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

  /* Live Session Card */
  .fd-dash-live-container { background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 28px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); padding: 2rem; margin-top: 2.5rem; animation: fdFadeIn 0.8s ease-out forwards; }
  .fd-dash-live-title { font-size: 1.5rem; line-height: 2rem; font-weight: 700; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem; color: #111827; }
  .fd-dash-icon-wrapper { width: 2.5rem; height: 2.5rem; border-radius: 0.75rem; background-color: #dcfce7; display: flex; align-items: center; justify-content: center; color: #16a34a; }
  .fd-dash-icon-pulse { animation: fdPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
  @keyframes fdPulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
  .fd-dash-live-details { display: flex; flex-direction: column; gap: 1.25rem; }
  .fd-dash-live-text { color: #4b5563; margin: 0; font-size: 1rem; }
  .fd-dash-live-label { color: #111827; font-weight: 600; }
  .fd-dash-status-active { color: #16a34a; font-weight: 700; letter-spacing: 0.025em; }
  .fd-dash-status-expired { color: #ef4444; font-weight: 700; letter-spacing: 0.025em; }
  .fd-dash-time-remaining { color: #ff5a00; font-weight: 700; font-size: 1.25rem; line-height: 1.75rem; letter-spacing: 0.05em; }
  .fd-dash-link-container { margin-top: 0; }
  .fd-dash-link-label { display: block; font-size: 14px; font-weight: 500; color: #4b5563; margin-bottom: 0.5rem; letter-spacing: 0.025em; }
  .fd-dash-link-field { display: block; width: 100%; height: 54px; padding-left: 1.25rem; padding-right: 1.25rem; border-radius: 16px; border: 1px solid #e5e7eb; background-color: #f9fafb; color: #4b5563; font-weight: 500; box-sizing: border-box; }
  .fd-dash-link-field:focus { outline: 2px solid transparent; outline-offset: 2px; }
  
  /* Buttons */
  .fd-dash-actions-container { display: flex; flex-wrap: wrap; gap: 1rem; padding-top: 0.75rem; }
  .fd-dash-btn { padding: 0.75rem 1.5rem; border-radius: 14px; font-weight: 600; transition: all 0.3s; display: flex; align-items: center; gap: 0.5rem; border-style: solid; border-width: 1px; cursor: pointer; font-size: 1rem; }
  .fd-dash-btn-copy { background-color: #eff6ff; border-color: #dbeafe; color: #1d4ed8; }
  .fd-dash-btn-copy:hover { background-color: #dbeafe; }
  .fd-dash-btn-end { background-color: #fef2f2; border-color: #fee2e2; color: #dc2626; }
  .fd-dash-btn-end:hover { background-color: #fee2e2; }
  .fd-dash-btn-end:disabled { opacity: 0.5; cursor: not-allowed; }
  
  /* Spinners & Dividers */
  .fd-dash-spinner-wrapper { display: flex; align-items: center; gap: 0.5rem; }
  .fd-dash-spinner-circle { width: 1rem; height: 1rem; border: 2px solid #dc2626; border-top-color: transparent; border-radius: 50%; animation: fdSpin 1s linear infinite; }
  @keyframes fdSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .fd-dash-divider { margin-top: 3rem; margin-bottom: 3rem; border-color: #e5e7eb; border-width: 1px 0 0; }
  
  /* Search Component */
  .fd-dash-search-container { margin-top: 2.5rem; margin-bottom: 1.5rem; }
  .fd-dash-search-wrapper { position: relative; }
  .fd-dash-search-icon-wrapper { position: absolute; top: 0; bottom: 0; left: 0; padding-left: 1.5rem; display: flex; align-items: center; pointer-events: none; transition: color 0.3s; }
  .fd-dash-search-icon { height: 22px; width: 22px; color: #9ca3af; }
  .fd-dash-search-input { display: block; width: 100%; height: 60px; padding-left: 56px; padding-right: 1.25rem; border-radius: 18px; border: 1px solid #e5e7eb; background-color: #ffffff; transition: all 0.3s; color: #111827; font-weight: 500; font-size: 16px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); box-sizing: border-box; }
  .fd-dash-search-input::placeholder { color: #9ca3af; }
  .fd-dash-search-input:focus { outline: none; border-color: #ff5a00; box-shadow: 0 0 0 2px rgba(255, 90, 0, 0.3); }

  /* Sub-Component: StatsCard */
  .fd-dash-stat-card { background: #fff; border-radius: 16px; padding: 1.5rem; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1); display: flex; align-items: center; gap: 1rem; }
  .fd-dash-stat-icon-bg { padding: 0.75rem; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
  .fd-dash-stat-info { display: flex; flex-direction: column; }
  .fd-dash-stat-title { font-size: 0.875rem; color: #6b7280; font-weight: 500; margin: 0 0 0.25rem 0; }
  .fd-dash-stat-value { font-size: 1.5rem; font-weight: 700; margin: 0; color: #111827; }

  /* Utility mapping for passed tailwind colors */
  .fd-dash-color-blue { background-color: #eff6ff; color: #2563eb; }
  .fd-dash-color-green { background-color: #f0fdf4; color: #16a34a; }
  .fd-dash-color-orange { background-color: #ffedd5; color: #ff5a00; }
  .fd-dash-color-gray { background-color: #f3f4f6; color: #6b7280; }

  /* Sub-Component: SessionForm */
  .fd-dash-form-wrapper { background: #fff; padding: 2rem; border-radius: 24px; border: 1px solid #e5e7eb; margin-top: 2rem; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.05); }
  .fd-dash-form-heading { margin: 0 0 1.5rem 0; font-size: 1.25rem; font-weight: 700; color: #111827; }
  .fd-dash-form-grid { display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom: 1.5rem; }
  .fd-dash-form-group { display: flex; flex-direction: column; gap: 0.5rem; }
  .fd-dash-form-label { font-size: 0.875rem; font-weight: 600; color: #4b5563; }
  .fd-dash-form-input { padding: 0.75rem 1rem; border-radius: 12px; border: 1px solid #d1d5db; background: #f9fafb; font-size: 1rem; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
  .fd-dash-form-input:focus { border-color: #ff5a00; }
  .fd-dash-form-submit { padding: 0.875rem 1.5rem; background-color: #16a34a; color: white; font-weight: 600; border: none; border-radius: 14px; cursor: pointer; transition: background-color 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; font-size: 1rem; }
  .fd-dash-form-submit:hover { background-color: #15803d; }
  .fd-dash-form-submit:disabled { opacity: 0.6; cursor: not-allowed; }

  /* Sub-Component: AttendanceSummary */
  .fd-dash-summary-wrapper { margin-top: 2rem; }
  .fd-dash-summary-heading { font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem; color: #111827; }
  .fd-dash-summary-empty { color: #6b7280; font-style: italic; }
  .fd-dash-summary-date-group { margin-bottom: 2rem; }
  .fd-dash-summary-date-title { font-size: 1.125rem; font-weight: 600; color: #374151; margin: 0 0 1rem 0; border-bottom: 2px solid #f3f4f6; padding-bottom: 0.5rem; }
  .fd-dash-summary-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.25rem; }
  .fd-dash-summary-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 1.25rem; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
  .fd-dash-summary-card:hover { transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-color: #d1d5db; }
  .fd-dash-summary-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
  .fd-dash-summary-dept { font-weight: 700; color: #111827; font-size: 1.125rem; }
  .fd-dash-summary-sec { background: #f3f4f6; color: #4b5563; padding: 0.25rem 0.75rem; border-radius: 8px; font-size: 0.875rem; font-weight: 600; }
  .fd-dash-summary-count { margin: 0; color: #6b7280; font-size: 0.95rem; }
  .fd-dash-summary-count strong { color: #16a34a; font-weight: 700; font-size: 1.125rem; margin-left: 0.25rem; }

  /* Sub-Component: StudentTable */
  .fd-dash-table-wrapper { overflow-x: auto; background: #fff; border-radius: 20px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.05); margin-bottom: 3rem; }
  .fd-dash-table { width: 100%; border-collapse: collapse; text-align: left; }
  .fd-dash-table-head { background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; }
  .fd-dash-table-th { padding: 1.25rem 1.5rem; font-size: 0.875rem; font-weight: 600; color: #4b5563; text-transform: uppercase; letter-spacing: 0.05em; }
  .fd-dash-table-tr { border-bottom: 1px solid #f3f4f6; transition: background-color 0.2s; }
  .fd-dash-table-tr:hover { background-color: #f8fafc; }
  .fd-dash-table-tr:last-child { border-bottom: none; }
  .fd-dash-table-td { padding: 1rem 1.5rem; font-size: 0.95rem; color: #111827; }
  .fd-dash-badge-present { display: inline-flex; padding: 0.25rem 0.75rem; background-color: #dcfce7; color: #166534; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.025em; }
  .fd-dash-badge-empty { padding: 2rem; text-align: center; color: #6b7280; font-style: italic; }
`;


// ==========================================
// 2. MERGED SUB-COMPONENTS
// ==========================================

const StatsCard = ({ title, value, icon: Icon, colorClass }) => {
  // Mapping the original tailwind color props to our unique classes
  let mappedColor = 'fd-dash-color-gray';
  if (colorClass?.includes('blue')) mappedColor = 'fd-dash-color-blue';
  if (colorClass?.includes('green')) mappedColor = 'fd-dash-color-green';
  if (colorClass?.includes('orange') || colorClass?.includes('#ff5a00')) mappedColor = 'fd-dash-color-orange';

  return (
    <div className="fd-dash-stat-card">
      <div className={`fd-dash-stat-icon-bg ${mappedColor}`}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
      <div className="fd-dash-stat-info">
        <h4 className="fd-dash-stat-title">{title}</h4>
        <p className="fd-dash-stat-value">{value}</p>
      </div>
    </div>
  );
};

const SessionForm = ({ radius, duration, setRadius, setDuration, startSession, loading }) => {
  return (
    <div className="fd-dash-form-wrapper">
      <h3 className="fd-dash-form-heading">Start New Attendance Session</h3>
      <div className="fd-dash-form-grid">
        <div className="fd-dash-form-group">
          <label className="fd-dash-form-label">Location Radius (Meters)</label>
          <input
            type="number"
            className="fd-dash-form-input"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
          />
        </div>
        <div className="fd-dash-form-group">
          <label className="fd-dash-form-label">Duration (Minutes)</label>
          <input
            type="number"
            className="fd-dash-form-input"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>
      </div>
      <button onClick={startSession} disabled={loading} className="fd-dash-form-submit">
        {loading ? (
          <>
            <div className="fd-dash-spinner-circle" style={{ borderColor: '#fff', borderTopColor: 'transparent' }}></div>
            Starting...
          </>
        ) : (
          <>
            <Activity size={18} strokeWidth={2.5} />
            Start Session
          </>
        )}
      </button>
    </div>
  );
};

const AttendanceSummary = ({ groupedSummary, fetchStudents }) => {
  return (
    <div className="fd-dash-summary-wrapper">
      <h3 className="fd-dash-summary-heading">Recent Attendance Summary</h3>
      {Object.keys(groupedSummary).length === 0 ? (
        <p className="fd-dash-summary-empty">No summary data available for recent sessions.</p>
      ) : (
        Object.keys(groupedSummary).map((date) => (
          <div key={date} className="fd-dash-summary-date-group">
            <h4 className="fd-dash-summary-date-title">{date}</h4>
            <div className="fd-dash-summary-grid">
              {groupedSummary[date].map((item, index) => (
                <div
                  key={index}
                  className="fd-dash-summary-card"
                  onClick={() => fetchStudents(item.department, item.section, true)}
                >
                  <div className="fd-dash-summary-header">
                    <span className="fd-dash-summary-dept">{item.department}</span>
                    <span className="fd-dash-summary-sec">Sec {item.section}</span>
                  </div>
                  <p className="fd-dash-summary-count">
                    Present: <strong>{item.student_count}</strong>
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const StudentTable = ({ students }) => {
  return (
    <div className="fd-dash-table-wrapper">
      <table className="fd-dash-table">
        <thead className="fd-dash-table-head">
          <tr>
            <th className="fd-dash-table-th">Roll Number</th>
            <th className="fd-dash-table-th">Name</th>
            <th className="fd-dash-table-th">Status</th>
          </tr>
        </thead>
        <tbody>
          {students && students.length > 0 ? (
            students.map((student, index) => (
              <tr key={index} className="fd-dash-table-tr">
                <td className="fd-dash-table-td" style={{ fontWeight: 500 }}>{student.roll_number}</td>
                <td className="fd-dash-table-td">{student.name}</td>
                <td className="fd-dash-table-td">
                  <span className="fd-dash-badge-present">Present</span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="fd-dash-badge-empty">
                No students found matching your criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};


// ==========================================
// 3. MAIN DASHBOARD COMPONENT
// ==========================================

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

  const [actionLoading, setActionLoading] = useState(false);
  const [endLoading, setEndLoading] = useState(false);

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
    const loadingToast = toast.loading("Loading students...");
    try {
      const response = await API.get(
        `attendance-list/?department=${department}&section=${section}`
      );
      setStudents(response.data);
      toast.success("Students loaded", { id: loadingToast });
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
      toast.error("Failed to load students", { id: loadingToast });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchSummary();
      if (selectedDepartment && selectedSection) {
        // Fetch silently in background without toast
        API.get(`attendance-list/?department=${selectedDepartment}&section=${selectedSection}`)
          .then(res => setStudents(res.data))
          .catch(console.error);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedDepartment, selectedSection]);

  const startSession = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    
    setActionLoading(true);
    const loadingToast = toast.loading("Starting Session...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await API.post(
            "start-session/",
            {
              faculty_latitude: position.coords.latitude,
              faculty_longitude: position.coords.longitude,
              radius,
              duration_minutes: duration
            }
          );
          setAttendanceLink(response.data.attendance_link);
          setExpiresAt(response.data.data.expires_at);
          setSessionActive(true);
          toast.success("Attendance Session Started", { id: loadingToast });
          fetchSummary();
        } catch (error) {
          const msg = error.response?.data?.message || "";
          if (msg.toLowerCase().includes("already active")) {
            checkActiveSession();
            toast.error("An attendance session is already active.", { id: loadingToast });
          } else {
            const errorMsg = msg
              || error.response?.data?.detail
              || JSON.stringify(error.response?.data)
              || "Unknown error. Please check your connection.";
            toast.error("Unable to Start Session: " + errorMsg, { id: loadingToast });
          }
        } finally {
          setActionLoading(false);
        }
      },
      (error) => {
        toast.error("Please allow location access: " + error.message, { id: loadingToast });
        setActionLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const endSession = async () => {
    setEndLoading(true);
    const loadingToast = toast.loading("Ending Session...");
    try {
      await API.post("end-session/");
      setSessionActive(false);
      setAttendanceLink("");
      setExpiresAt(null);
      setTimeLeft("");
      fetchSummary();
      toast.success("Attendance Session Ended", { id: loadingToast });
    } catch (error) {
      console.log(error);
      toast.error("Unable to End Session", { id: loadingToast });
    } finally {
      setEndLoading(false);
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
      {/* 100% Inlined CSS strictly targeting this component */}
      <style dangerouslySetInnerHTML={{ __html: DASHBOARD_STYLES }} />

      <div className="fd-dash-root">
        <Toaster position="top-center" />

        <div className="fd-dash-main">
          <Navbar />

          <h1 className="fd-dash-title">
            Welcome Back, Faculty
          </h1>

          <div className="fd-dash-stats-grid">
            <StatsCard
              title="Today's Sessions"
              value={sessionActive ? 1 : 0}
              icon={CalendarDays}
              colorClass="bg-blue-50 text-blue-600"
            />
            <StatsCard
              title="Present Students"
              value={
                summary.reduce(
                  (total, item) => total + item.student_count,
                  0
                )
              }
              icon={Users}
              colorClass="bg-green-50 text-green-600"
            />
            <StatsCard
              title="Status"
              value={sessionActive ? "Active" : "Inactive"}
              icon={Activity}
              colorClass={sessionActive ? "bg-orange-100 text-[#ff5a00]" : "bg-gray-100 text-gray-500"}
            />
          </div>

          {!sessionActive && (
            <SessionForm
              radius={radius}
              duration={duration}
              setRadius={setRadius}
              setDuration={setDuration}
              startSession={startSession}
              loading={actionLoading}
            />
          )}

          {attendanceLink && (
            <div className="fd-dash-live-container">
              <h2 className="fd-dash-live-title">
                <div className="fd-dash-icon-wrapper">
                  <Activity size={22} className="fd-dash-icon-pulse" strokeWidth={2.5} />
                </div>
                Live Attendance Session
              </h2>

              <div className="fd-dash-live-details">
                <p className="fd-dash-live-text">
                  <strong className="fd-dash-live-label">Status : </strong>{" "}
                  {sessionActive ? (
                    <span className="fd-dash-status-active">Active</span>
                  ) : (
                    <span className="fd-dash-status-expired">Expired</span>
                  )}
                </p>

                <p className="fd-dash-live-text">
                  <strong className="fd-dash-live-label">Time Remaining : </strong>{" "}
                  <span className="fd-dash-time-remaining">
                    {timeLeft}
                  </span>
                </p>

                <div className="fd-dash-link-container">
                  <label className="fd-dash-link-label">Attendance Link</label>
                  <input
                    className="fd-dash-link-field"
                    readOnly
                    value={attendanceLink}
                  />
                </div>

                <div className="fd-dash-actions-container">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(attendanceLink);
                      toast.success("Attendance Link Copied!");
                    }}
                    className="fd-dash-btn fd-dash-btn-copy"
                  >
                    <Copy size={18} strokeWidth={2.5} />
                    Copy Attendance Link
                  </button>
                  <button
                    onClick={endSession}
                    disabled={endLoading}
                    className="fd-dash-btn fd-dash-btn-end"
                  >
                    {endLoading ? (
                      <span className="fd-dash-spinner-wrapper">
                        <div className="fd-dash-spinner-circle"></div>
                        Processing...
                      </span>
                    ) : (
                      <>
                        <StopCircle size={18} strokeWidth={2.5} />
                        End Session
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          <hr className="fd-dash-divider" />

          <AttendanceSummary
            groupedSummary={groupedSummary}
            fetchStudents={fetchStudents}
          />
          
          <div className="fd-dash-search-container">
            <div className="fd-dash-search-wrapper">
              <div className="fd-dash-search-icon-wrapper">
                <Search className="fd-dash-search-icon" strokeWidth={2.5} />
              </div>
              <input
                type="text"
                placeholder="Search by Name or Roll Number"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="fd-dash-search-input"
              />
            </div>
          </div>

          <div ref={studentTableRef}>
            <StudentTable
              students={students.filter((student) =>
                student.name.toLowerCase().includes(search.toLowerCase()) ||
                student.roll_number.toLowerCase().includes(search.toLowerCase())
              )}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default FacultyDashboard;
