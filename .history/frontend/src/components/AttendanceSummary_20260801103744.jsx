function AttendanceSummary({
    groupedSummary,
    fetchStudents
}) {

    return (

        <div className="mt-8">

            <h2 className="text-2xl font-bold mb-6">

                📊 Attendance Summary

            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

                {

                    Object.keys(departments).map((department) =>

                        departments[department].map((item, index) => (

                            <div

                                key={`${department}-${index}`}

                                className="bg-white rounded-2xl shadow-lg p-6"

                            >

                                <h3 className="text-xl font-bold text-blue-700">

                                    {item.department} - {item.section}

                                </h3>

                                <p className="text-gray-500 mt-2">

                                    Students Present

                                </p>

                                <h1 className="text-5xl font-bold mt-4 text-green-600">

                                    {item.student_count}

                                </h1>

                                <button

                                    onClick={() =>
                                        fetchStudents(
                                            item.department,
                                            item.section,
                                            true
                                        )
                                    }

                                    className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"

                                >

                                    👥 View Students

                                </button>

                            </div>

                        ))

                    )

                }

            </div>

        </div>

    );

}

export default AttendanceSummary;