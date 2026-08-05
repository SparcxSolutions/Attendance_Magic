function Navbar() {

    const username = "faculty-1";

    return (

        <nav className="bg-white shadow-md rounded-xl p-5 flex justify-between items-center mb-8">

            <div>

                <h1 className="text-2xl font-bold text-blue-700">

                    🎓 Attendance Magic

                </h1>

            </div>

            <div className="flex items-center gap-5">

                <span className="font-semibold">

                    {username}

                </span>

                <button
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >

                    Logout

                </button>

            </div>

        </nav>

    );

}

export default Navbar;