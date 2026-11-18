const eventDetails =
    document.getElementById("event-details");


const params =
    new URLSearchParams(
        window.location.search
    );


const eventId =
    params.get("id");


if (!eventId) {

    eventDetails.innerHTML = `

        <h2>
            Event not found
        </h2>

        <a href="events.html">
            ← Back to Events
        </a>

    `;

} else {

    fetch(
        `http://localhost:5000/api/events/${eventId}`
    )

        .then(response => {

            if (!response.ok) {

                throw new Error(
                    "Event not found"
                );

            }

            return response.json();

        })

        .then(event => {

            console.log(
                "Event received:",
                event
            );


            eventDetails.innerHTML = `

                <div class="event-details-card">

                    <h1>
                        ${event.title}
                    </h1>


                    <p>
                        <strong>Category:</strong>
                        ${event.category}
                    </p>


                    <p>
                        <strong>Organized by:</strong>
                        ${event.club}
                    </p>


                    <p>
                        ${event.description}
                    </p>


                    <hr>


                    <h2>
                        Event Information
                    </h2>


                    <p>
                        📅
                        <strong>Date:</strong>
                        ${event.date}
                    </p>


                    <p>
                        🕐
                        <strong>Time:</strong>
                        ${event.time}
                    </p>


                    <p>
                        📍
                        <strong>Venue:</strong>
                        ${event.venue}
                    </p>


                    <p>
                        <strong>
                            Registration Deadline:
                        </strong>

                        ${event.registrationDeadline}
                    </p>


                    <p>
                        <strong>
                            Available Seats:
                        </strong>

                        ${event.seats}
                    </p>


                    <br>


                    <button
                        onclick="registerForEvent('${event._id}')">

                        Register Now

                    </button>


                    <br>
                    <br>


                    <a href="events.html">
                        ← Back to Events
                    </a>

                </div>

            `;

        })

        .catch(error => {

            console.error(
                "Event details error:",
                error
            );


            eventDetails.innerHTML = `

                <h2>
                    Unable to load event
                </h2>

                <a href="events.html">
                    ← Back to Events
                </a>

            `;

        });

}


function registerForEvent(eventId) {

    window.location.href =
        `event-register.html?id=${eventId}`;

}