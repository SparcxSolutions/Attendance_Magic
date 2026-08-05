import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
const [name, setName] = useState("");

const [rollNumber, setRollNumber] = useState("");

const [department, setDepartment] = useState("");

const [section, setSection] = useState("");

const [verified, setVerified] = useState(false);

const [distance, setDistance] = useState(null);

function StudentAttendance() {

    const { id } = useParams();

    const [session, setSession] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadSession();

    }, []);

    const loadSession = async () => {

        try {

            const response = await API.get(
                `session/${id}/`
            );

            setSession(response.data);

        }

        catch (error) {

            alert("Session Not Found");

        }

        finally {

            setLoading(false);

        }

    };

    if (loading) {

        return (

            <h2 className="text-center mt-20">

                Loading...

            </h2>

        );

    }

    if (!session) {

        return (

            <h2 className="text-center mt-20 text-red-600">

                Session Not Available

            </h2>

        );

    }

    return (

        <div className="min-h-screen bg-slate-100 flex justify-center items-center">

            <div className="bg-white shadow-xl rounded-2xl p-10 w-[700px]">

                <h1 className="text-4xl font-bold text-blue-700">

                    🎓 Attendance Magic

                </h1>

                <p className="text-gray-500 mt-2">

                    Student Attendance

                </p>

                <hr className="my-6"/>

                <h2 className="text-2xl font-bold">

                    Session Details

                </h2>

                <div className="mt-5 space-y-3">

                    <p>

                        <strong>Department :</strong>

                        {" "}

                        {session.department}

                    </p>

                    <p>

                        <strong>Section :</strong>

                        {" "}

                        {session.section}

                    </p>

                    <p>

                        <strong>Faculty :</strong>

                        {" "}

                        {session.faculty}

                    </p>

                    <p>

                        <strong>Attendance Radius :</strong>

                        {" "}

                        {session.radius} meters

                    </p>

                </div>

            </div>

        </div>

    );

}

export default StudentAttendance;