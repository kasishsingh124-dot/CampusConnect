const clubsContainer =
    document.getElementById("clubs-container");


fetch("http://localhost:5000/api/clubs")

    .then(response => {

        if (!response.ok) {
            throw new Error("Failed to fetch clubs");
        }

        return response.json();

    })

    .then(clubs => {

        console.log("Clubs received:", clubs);

        clubsContainer.innerHTML = "";


        clubs.forEach(club => {

            const card =
                document.createElement("div");


            card.classList.add("club-card");


            card.innerHTML = `

                <h3>
                    ${club.name}
                </h3>

                <p>
                    <strong>Category:</strong>
                    ${club.category}
                </p>

                <p>
                    ${club.description}
                </p>

                <p>
                    <strong>Members:</strong>
                    ${club.members}
                </p>

                <button
                    onclick="viewClub('${club._id}')">

                    View Club

                </button>

            `;


            clubsContainer.appendChild(card);

        });

    })

    .catch(error => {

        console.error(
            "Club loading error:",
            error
        );

        clubsContainer.innerHTML = `

            <p>
                Unable to load clubs.
            </p>

        `;

    });


function viewClub(clubId) {

    window.location.href =
        `club-details.html?id=${clubId}`;

}