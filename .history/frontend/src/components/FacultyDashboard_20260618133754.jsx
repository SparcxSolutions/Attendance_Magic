import { useEffect, useState } from "react";
import axios from "axios";

function FacultyDashboard() {

    const [summary, setSummary] = useState([]);
    const [students, setStudents] = useState([]);

    useEffect(() => {

        fetchSummary();

    }, []);

    const fetchSummary = async () => {

        try {

            const response = await axios.get(
                "http://127.0.0.1:8000/api/attendance-summary/"
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

            const response = await axios.get(
                `http://127.0.0.1:8000/api/attendance-list/?department=${department}&section=${section}`
            );

            setStudents(response.data);

        }

        catch (error) {

            console.log(error);

        }

    };

    return (

        <div>

            <h1>Faculty Dashboard</h1>

            {

                summary.map((item, index) => (

                    <div key={index}>

                        <h2>

                            {item.department} - {item.section}

                        </h2>

                        <h3>

                            Students Present : {item.student_count}

                        </h3>

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

                        <hr />

                    </div>

                ))

            }

            {

                students.length > 0 && (

                    <div>

                        <h2>

                            Student List

                        </h2>

                        {

                            students.map(
                                (
                                    student,
                                    index
                                ) => (

                                    <div
                                        key={student.id}
                                    >

                                        <h4>

                                            {index + 1}.
                                            {" "}
                                            {student.name}
                                            {" - "}
                                            {student.roll_number}

                                        </h4>

                                    </div>

                                )
                            )

                        }

                    </div>

                )

            }

        </div>

    );

}

export default FacultyDashboard;