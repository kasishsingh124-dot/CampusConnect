const params = new URLSearchParams(
    window.location.search
);

const eventId = params.get("id");

const eventName = document.getElementById("event-name");

const form = document.getElementById("registration-form");

const message = document.getElementById("registration-message");


// ==========================================
// LOAD EVENT INFORMATION
// ==========================================

if (!eventId) {

    eventName.textContent = "Event not found";

    form.style.display = "none";

} else {

    fetch(`http://localhost:5000/api/events/${eventId}`)

        .then(response => {

            if (!response.ok) {
                throw new Error("Event not found");
            }

            return response.json();

        })

        .then(event => {

            eventName.textContent =
                `Registering for: ${event.title}`;

        })

        .catch(error => {

            console.error(
                "Event loading error:",
                error
            );

            eventName.textContent =
                "Unable to load event";

        });

}


// ==========================================
// HANDLE REGISTRATION
// ==========================================

form.addEventListener("submit", function (e) {

    e.preventDefault();


    const registrationData = {

        name:
            document.getElementById("name").value.trim(),

        email:
            document.getElementById("email").value.trim(),

        course:
            document.getElementById("course").value.trim(),

        year:
            document.getElementById("year").value,

        phone:
            document.getElementById("phone").value.trim()

    };


    console.log(
        "Registration data:",
        registrationData
    );


    message.textContent = "Registering...";
    message.style.color = "black";


    fetch(
        `http://localhost:5000/api/events/${eventId}/register`,
        {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(registrationData)

        }
    )

    .then(async response => {

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.message || "Registration failed"
            );

        }

        return data;

    })

    .then(data => {

        message.textContent =
            data.message;

        message.style.color = "green";


        form.reset();

    })

    .catch(error => {

        console.error(
            "Registration error:",
            error
        );

        message.textContent =
            error.message;

        message.style.color = "red";

    });

});