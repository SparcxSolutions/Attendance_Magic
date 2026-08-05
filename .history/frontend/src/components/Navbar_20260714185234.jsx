import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Navbar() {

    const [username, setUsername] = useState("");

    const navigate = useNavigate();

    useEffect(() => {

        loadProfile();

    }, []);

    const loadProfile = async () => {

        try {

            const response = await API.get(
                "faculty-profile/"
            );

            setUsername(
                response.data.username
            );

        }

        catch (error) {

            console.log(error);

        }

    };

    const logout = () => {

        localStorage.removeItem("access");

        localStorage.removeItem("refresh");

        navigate("/");

    };

    return (

        <nav className="bg-white shadow-lg rounded-2xl p-5 flex justify-between items-center">

            <div>

                <h1 className="text-3xl font-bold text-blue-700">

                    🎓 Attendance Magic

                </h1>

                <p className="text-gray-500">

                    Faculty Portal

                </p>

            </div>

            <div className="flex items-center gap-6">

                <div className="text-right">

                    <h2 className="font-bold">

                        👤 {username}

                    </h2>

                    <p className="text-gray-500">

                        Logged In

                    </p>

                </div>

                <button

                    onClick={logout}

                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl"

                >

                    Logout

                </button>

            </div>

        </nav>

    );

}

export default Navbar;