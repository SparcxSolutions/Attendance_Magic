function SessionForm({

    department,
    section,
    radius,
    duration,

    setDepartment,
    setSection,
    setRadius,
    setDuration,

    startSession

}) {

    return (

        <div className="bg-white rounded-2xl shadow-lg p-8">

            <h2 className="text-2xl font-bold text-gray-800 mb-8">

                🚀 Start Attendance Session

            </h2>

            <div className="grid md:grid-cols-2 gap-6">

                <div>

                    <label className="block font-semibold mb-2">

                        Department

                    </label>

                    <select

                        className="w-full border rounded-xl p-3"

                        value={department}

                        onChange={(e)=>
                            setDepartment(e.target.value)
                        }

                    >

                        <option>CSE</option>
                        <option>CSD</option>
                        <option>ECE</option>

                    </select>

                </div>

                <div>

                    <label className="block font-semibold mb-2">

                        Section

                    </label>

                    <select

                        className="w-full border rounded-xl p-3"

                        value={section}

                        onChange={(e)=>
                            setSection(e.target.value)
                        }

                    >

                        <option>A</option>
                        <option>B</option>
                        <option>C</option>
                        <option>D</option>

                    </select>

                </div>

            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-8">

                <div>

                    <label className="block font-semibold mb-2">

                        📍 Attendance Radius

                    </label>

                    <input

                        type="number"

                        className="w-full border rounded-xl p-3"

                        value={radius}

                        onChange={(e)=>
                            setRadius(e.target.value)
                        }

                    />

                    <p className="text-sm text-gray-500 mt-2">

                        Students must be inside this radius.

                    </p>

                </div>

                <div>

                    <label className="block font-semibold mb-2">

                        ⏱ Session Duration

                    </label>

                    <input

                        type="number"

                        className="w-full border rounded-xl p-3"

                        value={duration}

                        onChange={(e)=>
                            setDuration(e.target.value)
                        }

                    />

                    <p className="text-sm text-gray-500 mt-2">

                        Attendance closes automatically.

                    </p>

                </div>

            </div>

            <button

                onClick={startSession}

                className="mt-10 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl"

            >

                🚀 Start Attendance Session

            </button>

        </div>

    );

}

export default SessionForm;