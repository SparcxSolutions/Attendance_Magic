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

            setMessage(
                "Invalid Username or Password"
            );

        }

    };

    return (

        <div
            style={{
                textAlign: "center",
                marginTop: "100px",
            }}
        >

            <h1>Attendance Magic</h1>

            <h2>Faculty Login</h2>

            <br />

            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) =>
                    setUsername(e.target.value)
                }
            />

            <br />
            <br />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) =>
                    setPassword(e.target.value)
                }
            />

            <br />
            <br />

            <button onClick={login}>
                Login
            </button>

            <br />
            <br />

            <h3>{message}</h3>

        </div>

    );

}

export default Login;