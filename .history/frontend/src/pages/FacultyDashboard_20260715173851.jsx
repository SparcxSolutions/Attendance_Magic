import Navbar from "../components/Navbar";
import StatsCard from "../components/StatsCard";
import { useEffect, useState } from "react";
import API from "../services/api";
import SessionForm from "../components/SessionForm";
import AttendanceLinkCard from "../components/AttendanceLinkCard";
import AttendanceSummary from "../components/AttendanceSummary";
import StudentTable from "../components/StudentTable";

function FacultyDashboard() {

    const [summary, setSummary] = useState([]);
    const [students, setStudents] = useState([]);

    
    
    const [radius, setRadius] = useState(100);
    const [duration, setDuration] = useState(2);

    const [attendanceLink, setAttendanceLink] = useState("");
    const [expiresAt, setExpiresAt] = useState(null);

const [timeLeft, setTimeLeft] = useState("");

const [sessionActive, setSessionActive] = useState(false);

    useEffect(() => {

        fetchSummary();

    }, []);
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

            const response = await API.get(
                "attendance-summary/"
            );

            setSummary(response.data);

        }

        catch (error) {

            console.log(error);

        }

    };

    const fetchStudents = async (
        department,
        section
    ) => {

        try {

            const response = await API.get(
                `attendance-list/?department=${department}&section=${section}`
            );

            setStudents(response.data);

        }

        catch (error) {

            console.log(error);

        }

    };

    const startSession = () => {

    if (!navigator.geolocation) {

        alert("Geolocation is not supported by your browser.");

        return;

    }

    navigator.geolocation.getCurrentPosition(

        async (position) => {

            try {

                const response = await API.post(
                    "start-session/",
                    {
                        department,
                        section,

                        faculty_latitude: position.coords.latitude,
                        faculty_longitude: position.coords.longitude,

                        radius,
                        duration_minutes: duration
                    }
                );

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

            }

            catch (error) {

                console.log(error);

                alert("Unable to Start Session");

            }

        },

        (error) => {

            console.log(error);

            alert("Please allow location access.");

        }

    );

};
    const departments = {};

    summary.forEach((item) => {

        if (!departments[item.department]) {

            departments[item.department] = [];

        }

        departments[item.department].push(item);

    });

    return (

        <div className="min-h-screen bg-slate-100 p-8">
            <Navbar />

<h1 className="text-3xl font-bold mb-8">
    Welcome Back 👋
</h1>

<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

    <StatsCard
        title="Departments"
        value={Object.keys(departments).length}
        color="bg-blue-600"
    />

    <StatsCard
        title="Students Loaded"
        value={students.length}
        color="bg-green-600"
    />

    <StatsCard
        title="Status"
        value="Active"
        color="bg-purple-600"
    />

</div>

            
           
            <SessionForm

    department={department}
    section={section}
    radius={radius}
    duration={duration}

    setDepartment={setDepartment}
    setSection={setSection}
    setRadius={setRadius}
    setDuration={setDuration}

    startSession={startSession}

/>

           

          {
    attendanceLink && (

        <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">

            <h2 className="text-2xl font-bold mb-6">

                Live Attendance Session

            </h2>

            <div className="space-y-3">

                <p>

                    <strong>Status :</strong>{" "}

                    {

                        sessionActive

                        ?

                        <span className="text-green-600 font-bold">

                            🟢 Active

                        </span>

                        :

                        <span className="text-red-600 font-bold">

                            🔴 Expired

                        </span>

                    }

                </p>

                <p>

                    <strong>Department :</strong> {department}

                </p>

                <p>

                    <strong>Section :</strong> {section}

                </p>

                <p>

                    <strong>Time Remaining :</strong>{" "}

                    <span className="font-bold text-blue-700">

                        {timeLeft}

                    </span>

                </p>

                <div className="mt-5">

                    <label className="font-semibold">

                        Attendance Link

                    </label>

                    <input

                        className="w-full border rounded-lg p-3 mt-2"

                        readOnly

                        value={attendanceLink}

                    />

                </div>

                <button

                    onClick={() => {

                        navigator.clipboard.writeText(attendanceLink);

                        alert("Attendance Link Copied");

                    }}

                    className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"

                >

                    📋 Copy Attendance Link

                </button>

            </div>

        </div>

    )

}

            <hr />

            <AttendanceSummary

    departments={departments}

    fetchStudents={fetchStudents}

/>

         <StudentTable students={students} />
        </div>

    );

}

export default FacultyDashboard;