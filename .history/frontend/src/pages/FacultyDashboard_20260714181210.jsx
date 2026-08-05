import Navbar from "../components/Navbar";
import StatsCard from "../components/StatsCard";
import { useEffect, useState } from "react";
import API from "../services/api";
import SessionForm from "../components/SessionForm";
import AttendanceLinkCard from "../components/AttendanceLinkCard";
import AttendanceSummary from "../components/AttendanceSummary";

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

    const startSession = async () => {

        try {

            const response = await API.post(
                "start-session/",
                {
                    department,
                    section,
                    faculty_latitude: 17.385,
                    faculty_longitude: 78.486,
                    radius,
                    duration_minutes: duration
                }
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

            <h1>Faculty Dashboard</h1>

            <hr />

            <h2>Start Attendance Session</h2>

            <br />

            {/* <select
                value={department}
                onChange={(e) =>
                    setDepartment(e.target.value)
                }
            >

                <option value="CSE">CSE</option>

                <option value="CSD">CSD</option>

                <option value="ECE">ECE</option>

            </select>

            &nbsp;&nbsp;

            <select
                value={section}
                onChange={(e) =>
                    setSection(e.target.value)
                }
            >

                <option value="A">A</option>

                <option value="B">B</option>

                <option value="C">C</option>

                <option value="D">D</option>

            </select>

            <br /><br />

            <input
                type="number"
                placeholder="Radius"
                value={radius}
                onChange={(e) =>
                    setRadius(e.target.value)
                }
            />

            &nbsp;&nbsp;

            <input
                type="number"
                placeholder="Duration"
                value={duration}
                onChange={(e) =>
                    setDuration(e.target.value)
                }
            /> */}

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

            <br /><br />

            <button onClick={startSession}>
                Start Session
            </button>

           <AttendanceLinkCard
    attendanceLink={attendanceLink}
/>

            <hr />

            <h2>Attendance Summary</h2>

            {

                Object.keys(departments).map(

                    (department) => (

                        <div key={department}>

                            <h2>

                                {department}

                            </h2>

                            <hr />

                            {

                                departments[
                                    department
                                ].map(

                                    (item, index) => (

                                        <div key={index}>

                                            <h3>

                                                {item.section} Section

                                            </h3>

                                            <h4>

                                                Students Present :{" "}

                                                {item.student_count}

                                            </h4>

                                            <button

                                                onClick={() =>
                                                    fetchStudents(
                                                        item.department,
                                                        item.section
                                                    )
                                                }

                                            >

                                                View Students

                                            </button>

                                            <br />

                                            <br />

                                        </div>

                                    )

                                )

                            }

                        </div>

                    )

                )

            }

            {

                students.length > 0 && (

                    <div>

                        <hr />

                        <h2>

                            Student List

                        </h2>

                        <table

                            border="1"

                            cellPadding="10"

                            style={{

                                margin: "auto",

                                borderCollapse: "collapse"

                            }}

                        >

                            <thead>

                                <tr>

                                    <th>S.No</th>

                                    <th>Name</th>

                                    <th>Roll Number</th>

                                    <th>Department</th>

                                    <th>Section</th>

                                </tr>

                            </thead>

                            <tbody>

                                {

                                    students.map(

                                        (
                                            student,
                                            index
                                        ) => (

                                            <tr

                                                key={student.id}

                                            >

                                                <td>

                                                    {index + 1}

                                                </td>

                                                <td>

                                                    {student.name}

                                                </td>

                                                <td>

                                                    {student.roll_number}

                                                </td>

                                                <td>

                                                    {student.department}

                                                </td>

                                                <td>

                                                    {student.section}

                                                </td>

                                            </tr>

                                        )

                                    )

                                }

                            </tbody>

                        </table>

                    </div>

                )

            }

        </div>

    );

}

export default FacultyDashboard;