function AttendanceLinkCard({ attendanceLink }) {

    if (!attendanceLink) return null;

    const copyLink = () => {

        navigator.clipboard.writeText(attendanceLink);

        alert("Attendance Link Copied!");

    };

    return (

        <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">

            <h2 className="text-2xl font-bold mb-6">

                🔗 Attendance Link

            </h2>

            <div className="flex flex-col md:flex-row gap-4">

                <input

                    readOnly

                    value={attendanceLink}

                    className="flex-1 border rounded-xl p-3 bg-gray-100"

                />

                <button

                    onClick={copyLink}

                    className="bg-green-600 hover:bg-green-700 text-white px-6 rounded-xl"

                >

                    📋 Copy Link

                </button>

            </div>

            <p className="text-sm text-gray-500 mt-3">

                Share this link with students to mark attendance.

            </p>

        </div>

    );

}

export default AttendanceLinkCard;