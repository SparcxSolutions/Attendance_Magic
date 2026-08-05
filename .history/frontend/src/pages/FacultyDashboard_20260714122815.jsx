import { useEffect, useState } from "react";
import API from "../services/api";

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

        <div style={{ textAlign: "center" }}>

            <h1>Faculty Dashboard</h1>

            <hr />

            <h2>Start Attendance Session</h2>

            <br />

            <select
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
            />

            <br /><br />

            <button onClick={startSession}>
                Start Session
            </button>

            {

                attendanceLink && (

                    <div>

                        <hr />

                        <h3>Attendance Link</h3>

                        <p>{attendanceLink}</p>

                        <button

                            onClick={() => {

                                navigator.clipboard.writeText(
                                    attendanceLink
                                );

                                alert("Link Copied");

                            }}

                        >

                            Copy Link

                        </button>

                    </div>

                )

            }

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