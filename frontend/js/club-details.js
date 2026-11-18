const clubDetails = document.getElementById("club-details");

const params = new URLSearchParams(window.location.search);

const clubId = params.get("id");

if (!clubId) {

    clubDetails.innerHTML = `
        <h2>Club not found</h2>
        <a href="index.html">Back to Clubs</a>
    `;

} else {

    fetch(`http://localhost:5000/api/clubs/${clubId}`)

        .then(response => {

            if (!response.ok) {
                throw new Error("Club not found");
            }

            return response.json();

        })

        .then(club => {

            clubDetails.innerHTML = `

                <div class="club-details-card">

                    <h1>${club.name}</h1>

                    <p class="category">
                        ${club.category}
                    </p>

                    <p>
                        ${club.description}
                    </p>

                    <p>
                        <strong>Members:</strong>
                        ${club.members}
                    </p>


                    <hr>


                    <h2>Core Members</h2>

                    <p>
                        President: Rahul
                    </p>

                    <p>
                        Vice President: Ananya
                    </p>

                    <p>
                        Secretary: Priya
                    </p>


                    <hr>


                    <h2>Upcoming Events</h2>

                    <div class="event-card">

                        <h3>
                            Hackathon 2026
                        </h3>

                        <p>
                            20 November 2026
                        </p>

                        <p>
                            Main Auditorium
                        </p>

                    </div>


                    <hr>


                    <h2>Recruitment</h2>

                    <p>
                        🟢 Recruitment Open
                    </p>

                    <p>
                        Application Deadline:
                        15 November 2026
                    </p>

                    <button>
                        Apply Now
                    </button>

                    <br><br>

                    <a href="index.html#clubs">
                        ← Back to Clubs
                    </a>

                </div>

            `;

        })

        .catch(error => {

            console.error(error);

            clubDetails.innerHTML = `
                <h2>Unable to load club</h2>
                <a href="index.html">
                    Back to Clubs
                </a>
            `;

        });
}