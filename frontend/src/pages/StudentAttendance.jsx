import { useEffect, useState, useRef } from "react";
import FacialChallenge from "../components/FacialChallenge";
import { useParams } from "react-router-dom";
import API from "../services/api";

function StudentAttendance() {

    const { id } = useParams();

    const [session, setSession] = useState(null);
    const [sessionExpired, setSessionExpired] = useState(false);
    const [loading, setLoading] = useState(true);
    const [attendanceDone, setAttendanceDone] = useState(false);

    const [name, setName] = useState("");
    const [rollNumber, setRollNumber] = useState("");
    const [department, setDepartment] = useState("");
    const [section, setSection] = useState("");

    const [verified, setVerified] = useState(false);
    const [distance, setDistance] = useState(null);

    const [faceImage, setFaceImage] = useState(null);
    const deviceId = (() => {

    let id = localStorage.getItem("device_id");

    if (!id) {

        id = crypto.randomUUID();

        localStorage.setItem(
            "device_id",
            id
        );

    }

    return id;

})();

  useEffect(() => {

    loadSession();

    const interval = setInterval(async () => {

        try {

            await API.get(`session/${id}/`);

        } catch (error) {

            if (
                error.response &&
                (error.response.status === 400 ||
                 error.response.status === 404)
            ) {
                setSessionExpired(true);
                clearInterval(interval);
            }

            // Ignore temporary server/network errors
        }

    }, 3000);

    return () => clearInterval(interval);

}, [id]);

    const loadSession = async () => {

        try {

            const response = await API.get(
                `session/${id}/`
            );

            setSession(response.data);

          setDepartment(response.data.department || "CSE");
setSection(response.data.section || "A");

        }

        // catch (error) {

        //     console.log(error);

        //     alert("Session Not Found");

        // }/
        catch (error) {

    if (
        error.response &&
        (error.response.status === 400 ||
         error.response.status === 404)
    ) {

        setSessionExpired(true);

    } else {

        alert("Unable to connect to server.");

    }

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

                            accuracy:
                                position.coords.accuracy,

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

            (error) => {
                alert(
                    "Unable to fetch location: " + error.message
                );
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );

    };

   if (sessionExpired) {

    return (

        <div className="min-h-screen flex items-center justify-center bg-slate-100">

            <div className="bg-white p-10 rounded-2xl shadow-xl text-center">

                <h1 className="text-3xl font-bold text-red-600">

                    ⏰ Attendance Session Expired

                </h1>

                <p className="mt-4 text-gray-600">

                    This attendance session has ended.

                </p>

            </div>

        </div>

    );

}

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

    if (!verified) {

        alert("Please verify your location first.");

        return;

    }

    if (!faceImage) {

        alert("Please capture your face.");

        return;

    }

    try {

        const response = await API.post(
            "mark-attendance/",
            {
                session_id: id,
                name,
                roll_number: rollNumber,
                department,
                section,
                device_id: deviceId,
                face_image: faceImage
            }
        );

        setAttendanceDone(true);

    } catch (error) {

        console.log(error.response?.data);

        alert(
            JSON.stringify(error.response?.data, null, 2)
        );

    }

};

if (attendanceDone) {

    return (

        <div className="min-h-screen bg-slate-100 flex justify-center items-center">

            <div className="bg-white shadow-xl rounded-2xl p-10 w-[650px] text-center">

                <div className="text-7xl">

                    ✅

                </div>

                <h1 className="text-4xl font-bold text-green-600 mt-5">

                    Attendance Submitted

                </h1>

                <p className="text-gray-600 mt-5 text-lg">

                    Your attendance has been recorded successfully.

                </p>

                <div className="bg-slate-100 rounded-xl p-5 mt-8 text-left">

                    <p>

                        <strong>Name :</strong> {name}

                    </p>

                    <p>

                        <strong>Roll Number :</strong> {rollNumber}

                    </p>

                    <p>

                        <strong>Department :</strong> {department}

                    </p>

                    <p>

                        <strong>Section :</strong> {section}

                    </p>

                </div>

                <p className="mt-8 text-gray-500">

                    You may now close this page.

                </p>

            </div>

        </div>

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

                <h2 className="text-2xl font-bold">

                    Session Details

                </h2>

                <div className="mt-5 space-y-3">

                    {/* <p>

                        <strong>Department :</strong>

                        {" "}

                        {session.department}

                    </p>

                    <p>

                        <strong>Section :</strong>

                        {" "}

                        {session.section}

                    </p> */}

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
                                <div className="mb-6">
                                    {!faceImage ? (
                                        <FacialChallenge onChallengeSuccess={(img) => setFaceImage(img)} />
                                    ) : (
                                        <div className="text-center">
                                            <h2 className="text-2xl font-bold mb-4">Face Verification</h2>
                                            <img src={faceImage} alt="Captured Face" className="w-full rounded-xl border max-w-md mx-auto" />
                                            <p className="text-green-600 font-semibold mt-3 text-lg">
                                                ✅ Challenge Completed Successfully
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {faceImage && (
                                    <>
                                        <h2 className="text-2xl font-bold mb-6">
                                            Student Details
                                        </h2>
                                        <div className="space-y-5">
                                            <div>
                                                <label className="block font-semibold mb-2">Full Name</label>
                                                <input
                                                    type="text"
                                                    className="w-full border rounded-xl p-3"
                                                    placeholder="Enter your full name"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block font-semibold mb-2">Roll Number</label>
                                                <input
                                                    type="text"
                                                    className="w-full border rounded-xl p-3"
                                                    placeholder="Enter Roll Number"
                                                    value={rollNumber}
                                                    onChange={(e) => setRollNumber(e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block font-semibold mb-2">Department</label>
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
                                                <label className="block font-semibold mb-2">Section</label>
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
                                            <button
                                                onClick={markAttendance}
                                                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-lg font-semibold"
                                            >
                                                ✅ Mark Attendance
                                            </button>
                                        </div>
                                    </>
                                )}
                            </>

                        )

                    }

                </div>

            </div>

        </div>

    );

}

export default StudentAttendance;