import Navbar from "../components/Navbar";
import StatsCard from "../components/StatsCard";
import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import SessionForm from "../components/SessionForm";
import AttendanceSummary from "../components/AttendanceSummary";
import StudentTable from "../components/StudentTable";
import { CalendarDays, Users, Activity, Copy, StopCircle, Search } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import "./FacultyDashboard.css";

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
        <div className="faculty-dashboard-wrapper">
            <Toaster position="top-center" />

            <div className="faculty-dashboard-main">
                <Navbar />

                <h1 className="faculty-dashboard-title">
                    Welcome Back, Faculty
                </h1>

                <div className="faculty-dashboard-stats-grid">
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
                    <div className="live-session-container">
                        <h2 className="live-session-title">
                            <div className="live-session-icon-wrapper">
                                <Activity size={22} className="live-session-icon-pulse" strokeWidth={2.5} />
                            </div>
                            Live Attendance Session
                        </h2>

                        <div className="live-session-details">
                            <p className="live-session-text">
                                <strong className="live-session-label">Status :</strong>{" "}
                                {sessionActive ? (
                                    <span className="status-active">Active</span>
                                ) : (
                                    <span className="status-expired">Expired</span>
                                )}
                            </p>

                            <p className="live-session-text">
                                <strong className="live-session-label">Time Remaining :</strong>{" "}
                                <span className="time-remaining">
                                    {timeLeft}
                                </span>
                            </p>

                            <div className="link-input-container">
                                <label className="link-input-label">Attendance Link</label>
                                <input
                                    className="link-input-field"
                                    readOnly
                                    value={attendanceLink}
                                />
                            </div>

                            <div className="action-buttons-container">
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(attendanceLink);
                                        toast.success("Attendance Link Copied!");
                                    }}
                                    className="btn-action btn-copy"
                                >
                                    <Copy size={18} strokeWidth={2.5} />
                                    Copy Attendance Link
                                </button>
                                <button
                                    onClick={endSession}
                                    disabled={endLoading}
                                    className={`btn-action btn-end`}
                                >
                                    {endLoading ? (
                                        <span className="spinner-wrapper">
                                            <div className="spinner-circle"></div>
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

                <hr className="dashboard-divider" />

                <AttendanceSummary
                    groupedSummary={groupedSummary}
                    fetchStudents={fetchStudents}
                />
                
                <div className="search-container">
                    <div className="search-input-wrapper">
                        <div className="search-icon-wrapper">
                            <Search className="search-icon" strokeWidth={2.5} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by Name or Roll Number"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="search-input"
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
    );
}

export default FacultyDashboard;
