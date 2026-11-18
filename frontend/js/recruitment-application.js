const params =
    new URLSearchParams(
        window.location.search
    );


const clubId =
    params.get("id");


const clubName =
    document.getElementById("club-name");


const form =
    document.getElementById(
        "application-form"
    );


const message =
    document.getElementById(
        "application-message"
    );


// ==========================================
// LOAD CLUB
// ==========================================

if (!clubId) {

    clubName.textContent =
        "Club not found";

    form.style.display = "none";

} else {

    fetch(
        `http://localhost:5000/api/clubs/${clubId}`
    )

        .then(response => {

            if (!response.ok) {

                throw new Error(
                    "Club not found"
                );

            }

            return response.json();

        })

        .then(club => {

            clubName.textContent =
                `Applying for: ${club.name}`;

        })

        .catch(error => {

            console.error(error);

            clubName.textContent =
                "Unable to load club";

        });

}


// ==========================================
// SUBMIT APPLICATION
// ==========================================

form.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const applicationData = {

            name:
                document.getElementById(
                    "name"
                ).value.trim(),

            email:
                document.getElementById(
                    "email"
                ).value.trim(),

            course:
                document.getElementById(
                    "course"
                ).value.trim(),

            year:
                document.getElementById(
                    "year"
                ).value,

            skills:
                document.getElementById(
                    "skills"
                ).value.trim(),

            reason:
                document.getElementById(
                    "reason"
                ).value.trim()

        };


        message.textContent =
            "Submitting application...";

        message.style.color =
            "black";


        fetch(
            `http://localhost:5000/api/clubs/${clubId}/apply`,
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(
                        applicationData
                    )

            }
        )

        .then(async response => {

            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Application failed"
                );

            }


            return data;

        })

        .then(data => {

            message.textContent =
                data.message;

            message.style.color =
                "green";


            form.reset();

        })

        .catch(error => {

            console.error(
                "Application error:",
                error
            );


            message.textContent =
                error.message;

            message.style.color =
                "red";

        });

    }
);