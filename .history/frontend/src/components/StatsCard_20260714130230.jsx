function StatsCard({

    title,

    value,

    color

}) {

    return (

        <div
            className={`rounded-xl shadow-lg p-6 text-white ${color}`}
        >

            <h2 className="text-lg">

                {title}

            </h2>

            <h1 className="text-4xl font-bold mt-3">

                {value}

            </h1>

        </div>

    );

}

export default StatsCard;