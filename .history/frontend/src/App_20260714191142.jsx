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

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/faculty"
                    element={<FacultyDashboard />}
                />

            </Routes>

        </BrowserRouter>

    );

}

export default App;