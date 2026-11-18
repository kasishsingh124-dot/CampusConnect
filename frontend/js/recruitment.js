const recruitmentContainer =
    document.getElementById(
        "recruitment-container"
    );


fetch("http://localhost:5000/api/clubs")

    .then(response => {

        if (!response.ok) {

            throw new Error(
                "Failed to fetch clubs"
            );

        }

        return response.json();

    })

    .then(clubs => {

        recruitmentContainer.innerHTML = "";


        clubs.forEach(club => {

            const card =
                document.createElement("div");


            card.classList.add(
                "recruitment-card"
            );


            if (club.recruitmentOpen) {

                card.innerHTML = `

                    <h2>
                        ${club.name}
                    </h2>

                    <p>
                        <strong>
                            Category:
                        </strong>

                        ${club.category}
                    </p>

                    <p>
                        ${club.description}
                    </p>

                    <p class="open-status">

                        🟢 Recruitment Open

                    </p>

                    <p>

                        <strong>
                            Application Deadline:
                        </strong>

                        ${club.recruitmentDeadline}

                    </p>

                    <button
                        onclick="applyToClub('${club._id}')">

                        Apply Now

                    </button>

                `;

            } else {

                card.innerHTML = `

                    <h2>
                        ${club.name}
                    </h2>

                    <p>
                        <strong>
                            Category:
                        </strong>

                        ${club.category}
                    </p>

                    <p>
                        ${club.description}
                    </p>

                    <p class="closed-status">

                        🔴 Recruitment Closed

                    </p>

                    <button
                        disabled>

                        Recruitment Closed

                    </button>

                `;

            }


            recruitmentContainer.appendChild(
                card
            );

        });

    })

    .catch(error => {

        console.error(
            "Recruitment error:",
            error
        );


        recruitmentContainer.innerHTML = `

            <p>
                Unable to load recruitment information.
            </p>

        `;

    });


function applyToClub(clubId) {

    window.location.href =
        `recruitment-application.html?id=${clubId}`;

}