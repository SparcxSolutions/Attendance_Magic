import { useEffect, useState } from "react";
import axios from "axios";

function FacultyDashboard() {

    const [summary, setSummary] = useState([]);

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

    return (

        <div>

            <h1>Faculty Dashboard</h1>

            {

                summary.map((item, index) => (

                    <div key={index}>

                        <h3>

                            {item.department} - {item.section}

                        </h3>

                        <h4>

                            Students Present : {item.student_count}

                        </h4>

                        <hr />

                    </div>

                ))

            }

        </div>

    );

}

export default FacultyDashboard;  