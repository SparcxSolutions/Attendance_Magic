import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Login() {

    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const login = async () => {

        try {

            const response = await API.post(
                "login/",
                {
                    username,
                    password,
                }
            );

            localStorage.setItem(
                "access",
                response.data.access
            );

            localStorage.setItem(
                "refresh",
                response.data.refresh
            );

            navigate("/faculty");

        }

        catch (error) {

            setMessage("Invalid Username or Password");

        }

    };

    return (

        <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 flex items-center justify-center">

            <div className="bg-white shadow-2xl rounded-3xl p-10 w-[420px]">

                <div className="text-center">

                    <h1 className="text-4xl font-extrabold text-blue-700">

                        Attendance Magic

                    </h1>

                    <p className="text-gray-500 mt-2">

                        Smart Mass Attendance Management System

                    </p>

                </div>

                <div className="mt-10">

                    <label className="font-semibold">

                        Username

                    </label>

                    <input

                        type="text"

                        className="w-full mt-2 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"

                        placeholder="Enter Username"

                        value={username}

                        onChange={(e) =>
                            setUsername(e.target.value)
                        }

                    />

                </div>

                <div className="mt-5">

                    <label className="font-semibold">

                        Password

                    </label>

                    <input

                        type="password"

                        className="w-full mt-2 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"

                        placeholder="Enter Password"

                        value={password}

                        onChange={(e) =>
                            setPassword(e.target.value)
                        }

                    />

                </div>

                {

                    message &&

                    <p className="text-red-600 mt-4 text-center">

                        {message}

                    </p>

                }

                <button

                    onClick={login}

                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl mt-8 transition"

                >

                    Login

                </button>

            </div>

        </div>

    );

}

export default Login;