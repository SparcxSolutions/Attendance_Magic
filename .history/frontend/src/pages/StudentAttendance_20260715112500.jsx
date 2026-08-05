import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

function StudentAttendance() {

    const { id } = useParams();

    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [attendanceDone, setAttendanceDone] = useState(false);

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

            setDepartment(
                response.data.department
            );

            setSection(
                response.data.section
            );

        }

        catch (error) {

            console.log(error);

            alert("Session Not Found");

        }

        finally {

            setLoading(false);

        }

    };

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

                            latitude:
                                position.coords.latitude,

                            longitude:
                                position.coords.longitude,

                        }

                    );

                    setVerified(
                        response.data.verified
                    );

                    setDistance(
                        response.data.distance
                    );

                    if (
                        response.data.verified
                    ) {

                        alert(
                            "Location Verified Successfully"
                        );

                    }

                    else {

                        alert(
                            "You are outside the attendance area."
                        );

                    }

                }

                catch (error) {

                    alert(

                        error.response?.data?.message ||

                        "Verification Failed"

                    );

                }

            },

            () => {

                alert(
                    "Unable to fetch location."
                );

            }

        );

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
const markAttendance = async () => {

    console.log("1");

    console.log("verified =", verified);

    console.log("2");

    const response = await API.post(
        "mark-attendance/",
        {
            session_id: id,
            name,
            roll_number: rollNumber,
            department,
            section
        }
    );

    console.log("3");

    alert(response.data.message);

};

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

                        <strong>

                            Attendance Radius :

                        </strong>

                        {" "}

                        {session.radius} meters

                    </p>

                </div>

                <hr className="my-8" />

                <h2 className="text-2xl font-bold mb-5">

                    📍 Verify Your Location

                </h2>

                <p className="text-gray-500 mb-4">

                    Please verify your location before entering your attendance details.

                </p>

                <div className="space-y-4">

                    <p>

                        <strong>Status :</strong>{" "}

                        {

                            verified ?

                                <span className="text-green-600 font-bold">

                                    ✅ Verified

                                </span>

                                :

                                <span className="text-orange-600 font-bold">

                                    Waiting for Verification

                                </span>

                        }

                    </p>

                    {

                        distance !== null && (

                            <p>

                                <strong>

                                    Distance :

                                </strong>

                                {" "}

                                {distance} meters

                            </p>

                        )

                    }

                    <button

                        onClick={verifyLocation}

                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"

                    >

                        📍 Verify My Location

                    </button>

                    {

                        !verified && distance !== null && (

                            <div className="bg-red-100 text-red-700 p-4 rounded-xl">

                                ❌ You are outside the attendance area.

                            </div>

                        )

                    }

                    {                        verified && (

                            <>

                                <hr className="my-8" />

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
                                            placeholder="Enter your full name"
                                            value={name}
                                            onChange={(e) =>
                                                setName(e.target.value)
                                            }
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
                                            onChange={(e) =>
                                                setRollNumber(e.target.value)
                                            }
                                        />

                                    </div>

                                    <div>

                                        <label className="block font-semibold mb-2">

                                            Department

                                        </label>

                                        <select
                                            className="w-full border rounded-xl p-3"
                                            value={department}
                                            onChange={(e) =>
                                                setDepartment(e.target.value)
                                            }
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
                                            onChange={(e) =>
                                                setSection(e.target.value)
                                            }
                                        >

                                            <option value="A">A</option>
                                            <option value="B">B</option>
                                            <option value="C">C</option>
                                            <option value="D">D</option>

                                        </select>

                                    </div>

                                    <button

                                    onClick={markAttendance}

                                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-lg font-semibold"

                                    >

                                    ✅ Mark Attendance

                                    </button>

                                </div>

                            </>

                        )

                    }

                </div>

            </div>

        </div>

    );

}

export default StudentAttendance;