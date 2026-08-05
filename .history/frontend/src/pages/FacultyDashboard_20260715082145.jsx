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

    const [department, setDepartment] = useState("CSE");
    const [section, setSection] = useState("A");
    const [radius, setRadius] = useState(100);
    const [duration, setDuration] = useState(2);

    const [attendanceLink, setAttendanceLink] = useState("");

    useEffect(() => {

        fetchSummary();

    }, []);

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

                setAttendanceLink(
                    response.data.attendance_link
                );

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

           

           <AttendanceLinkCard
    attendanceLink={attendanceLink}
/>

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