import Navbar from "../components/Navbar";
import StatsCard from "../components/StatsCard";
import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import SessionForm from "../components/SessionForm";
import AttendanceSummary from "../components/AttendanceSummary";
import StudentTable from "../components/StudentTable";
import { CalendarDays, Users, Activity, Copy, StopCircle, Search } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

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
        <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans relative overflow-x-hidden animate-fade-in">
            <Toaster position="top-center" />
            <style>
                {`
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    .animate-fade-in {
                        animation: fadeIn 0.8s ease-out forwards;
                    }
                    input::placeholder {
                        color: #9ca3af;
                    }
                `}
            </style>

            <div className="relative z-10 max-w-7xl mx-auto">
                <Navbar />

                <h1 className="text-[32px] sm:text-[36px] font-extrabold mb-8 mt-10 tracking-tight text-gray-900">
                    Welcome Back, Faculty
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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
                    <div className="bg-white border border-gray-200 rounded-[28px] shadow-sm p-8 mt-10 animate-fade-in">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
                            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                                <Activity size={22} className="animate-pulse" strokeWidth={2.5} />
                            </div>
                            Live Attendance Session
                        </h2>

                        <div className="space-y-5">
                            <p className="text-gray-600">
                                <strong className="text-gray-900 font-semibold">Status :</strong>{" "}
                                {sessionActive ? (
                                    <span className="text-green-600 font-bold tracking-wide">Active</span>
                                ) : (
                                    <span className="text-red-500 font-bold tracking-wide">Expired</span>
                                )}
                            </p>

                            <p className="text-gray-600">
                                <strong className="text-gray-900 font-semibold">Time Remaining :</strong>{" "}
                                <span className="text-[#ff5a00] font-bold text-xl tracking-wider">
                                    {timeLeft}
                                </span>
                            </p>

                            <div>
                                <label className="block text-[14px] font-medium text-gray-600 mb-2 tracking-wide">Attendance Link</label>
                                <input
                                    className="block w-full h-[54px] px-5 rounded-[16px] border border-gray-200 bg-gray-50 text-gray-600 font-medium focus:outline-none"
                                    readOnly
                                    value={attendanceLink}
                                />
                            </div>

                            <div className="flex flex-wrap gap-4 pt-3">
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(attendanceLink);
                                        toast.success("Attendance Link Copied!");
                                    }}
                                    className="bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-700 px-6 py-3 rounded-[14px] font-semibold transition-all duration-300 flex items-center gap-2"
                                >
                                    <Copy size={18} strokeWidth={2.5} />
                                    Copy Attendance Link
                                </button>
                                <button
                                    onClick={endSession}
                                    disabled={endLoading}
                                    className={`bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 px-6 py-3 rounded-[14px] font-semibold transition-all duration-300 flex items-center gap-2 ${endLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {endLoading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
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

                <hr className="my-12 border-gray-200" />

                <AttendanceSummary
                    groupedSummary={groupedSummary}
                    fetchStudents={fetchStudents}
                />
                
                <div className="mt-10 mb-6">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none transition-colors duration-300">
                            <Search className="h-[22px] w-[22px] text-gray-400" strokeWidth={2.5} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by Name or Roll Number"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="block w-full h-[60px] pl-[56px] pr-5 rounded-[18px] border border-gray-200 bg-white focus:bg-white focus:outline-none focus:ring-[2px] focus:ring-[#ff5a00]/30 focus:border-[#ff5a00] transition-all duration-300 text-gray-900 font-medium text-[16px] placeholder-gray-400 shadow-sm"
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
