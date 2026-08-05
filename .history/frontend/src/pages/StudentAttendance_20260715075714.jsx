import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

function StudentAttendance() {

    const { id } = useParams();
    console.log("Session ID:", id);

    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    const [name, setName] = useState("");
    const [rollNumber, setRollNumber] = useState("");
    const [department, setDepartment] = useState("");
    const [section, setSection] = useState("");

    const [verified, setVerified] = useState(false);
    const [distance, setDistance] = useState(null);

    useEffect(() => {
        loadSession();
    }, []);

    const loadSession = async () => {

        try {

            const response = await API.get(
                `session/${id}/`
            );

            setSession(response.data);

            setDepartment(response.data.department);
            setSection(response.data.section);

        }

        catch (error) {
    console.log(error);
    console.log(error.response);
    console.log(error.message);

    alert("Session Not Found");
}

        finally {

            setLoading(false);

        }

    };

    if (loading) {

        return (
            <h2 className="text-center mt-20 text-2xl">
                Loading...
            </h2>
        );

    }

    if (!session) {

        return (
            <h2 className="text-center mt-20 text-red-600 text-2xl">
                Session Not Available
            </h2>
        );

    }

    return (

        <div className="min-h-screen bg-slate-100 flex justify-center items-center py-10">

            <div className="bg-white shadow-xl rounded-2xl p-10 w-[700px]">

                <h1 className="text-4xl font-bold text-blue-700">

                    🎓 Attendance Magic

                </h1>

                <p className="text-gray-500 mt-2">

                    Student Attendance

                </p>

                <hr className="my-6" />

                {/* Session Details */}

                <h2 className="text-2xl font-bold">

                    Session Details

                </h2>

                <div className="mt-5 space-y-3">

                    <p>

                        <strong>Department :</strong>{" "}
                        {session.department}

                    </p>

                    <p>

                        <strong>Section :</strong>{" "}
                        {session.section}

                    </p>

                    <p>

                        <strong>Faculty :</strong>{" "}
                        {session.faculty}

                    </p>

                    <p>

                        <strong>Attendance Radius :</strong>{" "}
                        {session.radius} meters

                    </p>

                </div>

                <hr className="my-8" />

                {/* Student Details */}

                <h2 className="text-2xl font-bold mb-6">

                    Student Details

                </h2>

                <div className="space-y-5">

                    <div>

                        <label className="block font-semibold mb-2">

                            Full Name

                        </label>

                        <input
                            type="text"
                            className="w-full border rounded-xl p-3"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />

                    </div>

                    <div>

                        <label className="block font-semibold mb-2">

                            Roll Number

                        </label>

                        <input
                            type="text"
                            className="w-full border rounded-xl p-3"
                            placeholder="Enter Roll Number"
                            value={rollNumber}
                            onChange={(e) => setRollNumber(e.target.value)}
                        />

                    </div>

                    <div>

                        <label className="block font-semibold mb-2">

                            Department

                        </label>

                        <select
                            className="w-full border rounded-xl p-3"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                        >

                            <option value="CSE">CSE</option>
                            <option value="CSD">CSD</option>
                            <option value="ECE">ECE</option>

                        </select>

                    </div>

                    <div>

                        <label className="block font-semibold mb-2">

                            Section

                        </label>

                        <select
                            className="w-full border rounded-xl p-3"
                            value={section}
                            onChange={(e) => setSection(e.target.value)}
                        >

                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>

                        </select>

                    </div>

                </div>

                <hr className="my-8" />

                {/* Location Verification */}

                <h2 className="text-2xl font-bold mb-5">

                    📍 Verify Location

                </h2>

                <div className="space-y-4">

                    <p>

                        <strong>Status :</strong>{" "}

                        {

                            verified

                                ?

                                <span className="text-green-600 font-bold">

                                    Verified

                                </span>

                                :

                                <span className="text-red-600 font-bold">

                                    Not Verified

                                </span>

                        }

                    </p>

                    {

                        distance !== null && (

                            <p>

                                <strong>Distance :</strong> {distance} meters

                            </p>

                        )

                    }

                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
                    >

                        Verify My Location

                    </button>
                    

                </div>

            </div>

        </div>

    );

}
const verifyLocation = () => {

    if (!navigator.geolocation) {

        alert("Geolocation is not supported.");

        return;

    }

    navigator.geolocation.getCurrentPosition(

        async (position) => {

            try {

                const response = await API.post(
                    "verify-location/",
                    {
                        session_id: id,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    }
                );

                setVerified(response.data.verified);
                setDistance(response.data.distance);

            } catch (error) {

                alert(error.response?.data?.message || "Verification Failed");

            }

        },

        () => {

            alert("Unable to fetch location.");

        }

    );

};

export default StudentAttendance;