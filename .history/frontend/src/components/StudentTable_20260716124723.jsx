import React from "react";
import API from "../services/api";
function StudentTable({ students }) {
const downloadExcel = async () => {

    const department = students[0]?.department;
    const section = students[0]?.section;

    if (!department || !section) {

        alert("No attendance data.");

        return;

    }

    try {

        const response = await API.get(

            `export-excel/?department=${department}&section=${section}`,

            {
                responseType: "blob",
            }

        );

        const url = window.URL.createObjectURL(

            new Blob([response.data])

        );

        const link = document.createElement("a");

        link.href = url;

        link.download = `${department}_${section}_Attendance.xlsx`;

        document.body.appendChild(link);

        link.click();

        link.remove();

    }

    catch (error) {

        console.log(error);

        alert("Unable to download Excel");

    }

};
    if (students.length === 0) return null;

    return (

        <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">

            <div className="flex justify-between items-center mb-6">

                <h2 className="text-2xl font-bold">

                    👨‍🎓 Student List

                </h2>

                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold">

                    Total Students : {students.length}

                </span>

            </div>

            <div className="overflow-x-auto">
                <button
    onClick={() => {

        const department = students[0]?.department;
        const section = students[0]?.section;

        if (!department || !section) {

            alert("No attendance data available.");

            return;

        }

        window.open(

            `http://127.0.0.1:8000/api/export-excel/?department=${department}&section=${section}`,

            "_blank"

        );

    }}

    className="mb-4 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"

>

    📥 Download Excel

</button>

                <table className="w-full border-collapse">

                    <thead>

                        <tr className="bg-blue-600 text-white">

                            <th className="p-3">S.No</th>
                            <th className="p-3">Name</th>
                            <th className="p-3">Roll Number</th>
                            <th className="p-3">Department</th>
                            <th className="p-3">Section</th>
                            <th className="px-6 py-4">Time</th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            students.map((student, index) => (

                                <tr
                                    key={student.id}
                                    className="border-b hover:bg-gray-100"
                                >

                                    <td className="p-3 text-center">

                                        {index + 1}

                                    </td>

                                    <td className="p-3">

                                        {student.name}

                                    </td>

                                    <td className="p-3">

                                        {student.roll_number}

                                    </td>

                                    <td className="p-3 text-center">

                                        {student.department}

                                    </td>

                                    <td className="p-3 text-center">

                                        {student.section}

                                    </td>
                                    <td>
    {new Date(student.attendance_time).toLocaleTimeString()}
</td>

                                </tr>

                            ))

                        }

                    </tbody>

                </table>

            </div>

        </div>

    );

}

export default StudentTable;