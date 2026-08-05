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

    const departments = {};

    summary.forEach((item) => {

        if (!departments[item.department]) {

            departments[item.department] = [];

        }

        departments[item.department].push(item);

    });

    return (

        <div>

            <h1>Faculty Dashboard</h1>

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

                                                Students Present :
                                                {" "}
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

                        {

                            students.map(

                                (
                                    student,
                                    index
                                ) => (

                                    <h4
                                        key={student.id}
                                    >

                                        {index + 1}
                                        {". "}

                                        {student.name}

                                        {" - "}

                                        {student.roll_number}

                                    </h4>

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