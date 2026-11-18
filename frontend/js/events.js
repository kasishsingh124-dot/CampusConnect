const eventsContainer =
    document.getElementById("events-container");


fetch("http://localhost:5000/api/events")

    .then(response => {

        if (!response.ok) {
            throw new Error("Failed to fetch events");
        }

        return response.json();

    })

    .then(events => {

        console.log("Events received:", events);

        eventsContainer.innerHTML = "";


        events.forEach(event => {

            const card =
                document.createElement("div");


            card.classList.add("event-card");


            card.innerHTML = `

                <h2>
                    ${event.title}
                </h2>

                <p>
                    <strong>Organized by:</strong>
                    ${event.club}
                </p>

                <p>
                    <strong>Category:</strong>
                    ${event.category}
                </p>

                <p>
                    ${event.description}
                </p>

                <p>
                    📅 ${event.date}
                </p>

                <p>
                    🕐 ${event.time}
                </p>

                <p>
                    📍 ${event.venue}
                </p>

                <p>
                    <strong>Registration Deadline:</strong>
                    ${event.registrationDeadline}
                </p>

                <p>
                    <strong>Available Seats:</strong>
                    ${event.seats}
                </p>

                <button
                    onclick="viewEvent('${event._id}')">

                    View Details

                </button>

            `;


            eventsContainer.appendChild(card);

        });

    })

    .catch(error => {

        console.error(
            "Event loading error:",
            error
        );

        eventsContainer.innerHTML = `
            <p>Unable to load events.</p>
        `;

    });


function viewEvent(eventId) {

    window.location.href =
        `event-details.html?id=${eventId}`;

}