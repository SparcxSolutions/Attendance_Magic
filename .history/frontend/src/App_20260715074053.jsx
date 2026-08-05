import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";

import Login from "./pages/Login";
import FacultyDashboard from "./pages/FacultyDashboard";
import StudentAttendance from "./pages/StudentAttendance";

function App() {

    return (

        <BrowserRouter>

            <Routes>

                {/* Login Page */}
                <Route
                    path="/"
                    element={<Login />}
                />

                {/* Faculty Dashboard */}
                <Route
                    path="/faculty"
                    element={<FacultyDashboard />}
                />

                {/* Student Attendance */}
                <Route
                    path="/attendance/:id"
                    element={<StudentAttendance />}
                />

            </Routes>

        </BrowserRouter>

    );

}

export default App;