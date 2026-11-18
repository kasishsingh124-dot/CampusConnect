
const adminToken =
    localStorage.getItem("adminToken");


if (!adminToken) {

    window.location.href =
        "admin-login.html";

}


// ==================================================
// HTML ELEMENTS
// ==================================================

const clubCount =
    document.getElementById("club-count");

const eventCount =
    document.getElementById("event-count");

const applicationCount =
    document.getElementById("application-count");

const clubsContainer =
    document.getElementById(
        "admin-clubs-container"
    );

const eventsContainer =
    document.getElementById(
        "admin-events-container"
    );

const applicationsContainer =
    document.getElementById(
        "applications-container"
    );


// ==================================================
// LOGOUT
// ==================================================

function logout() {

    localStorage.removeItem("adminToken");

    window.location.href =
        "admin-login.html";

}


document
    .getElementById("logout-button")
    .addEventListener(
        "click",
        logout
    );


// ==================================================
// RESPONSE HANDLER
// ==================================================

async function readResponse(response) {

    const text =
        await response.text();


    console.log(
        "HTTP Status:",
        response.status
    );

    console.log(
        "Server response:",
        text
    );


    let data;

    try {

        data =
            JSON.parse(text);

    } catch (error) {

        throw new Error(
            "Backend returned HTML instead of JSON. Make sure Node.js is running on http://localhost:5000."
        );

    }


    if (response.status === 401) {

        localStorage.removeItem(
            "adminToken"
        );

        window.location.href =
            "admin-login.html";

        return null;

    }


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Request failed."
        );

    }


    return data;

}


// ==================================================
// FORMAT DATE
// ==================================================

function formatDate(date) {

    if (!date) {
        return "";
    }


    const parts =
        date.split("-");


    if (parts.length !== 3) {

        return date;

    }


    return `${parts[2]}-${parts[1]}-${parts[0]}`;

}


// ==================================================
// LOAD CLUBS
// ==================================================

async function loadClubs() {

    try {

        const response =
            await fetch(
                "http://localhost:5000/api/clubs"
            );


        const clubs =
            await readResponse(
                response
            );


        if (!clubs) {
            return;
        }


        clubCount.textContent =
            clubs.length;


        clubsContainer.innerHTML = "";


        if (clubs.length === 0) {

            clubsContainer.innerHTML = `
                <p>
                    No clubs found.
                </p>
            `;

            return;

        }


        clubs.forEach(club => {

            const card =
                document.createElement("div");


            card.className =
                "management-card";


            card.innerHTML = `

                <div>

                    <h3>
                        ${club.name}
                    </h3>

                    <p>
                        <strong>
                            Category:
                        </strong>

                        ${club.category}
                    </p>

                    <p>
                        ${club.description}
                    </p>

                    <p>
                        <strong>
                            Members:
                        </strong>

                        ${club.members}
                    </p>

                    <p>
                        <strong>
                            Recruitment:
                        </strong>

                        ${
                            club.recruitmentOpen
                            ? "🟢 Open"
                            : "🔴 Closed"
                        }
                    </p>

                    ${
                        club.recruitmentDeadline
                        ? `
                            <p>
                                <strong>
                                    Recruitment Deadline:
                                </strong>

                                ${formatDate(
                                    club.recruitmentDeadline
                                )}
                            </p>
                        `
                        : ""
                    }

                </div>


                <div class="management-actions">

                    <button
                        type="button"
                        onclick="editClub('${club._id}')">

                        Edit

                    </button>


                    <button
                        type="button"
                        class="danger-button"
                        onclick="deleteClub('${club._id}')">

                        Delete

                    </button>

                </div>

            `;


            clubsContainer.appendChild(
                card
            );

        });

    }

    catch (error) {

        console.error(
            "LOAD CLUBS ERROR:",
            error
        );


        clubsContainer.innerHTML = `
            <p>
                ${error.message}
            </p>
        `;

    }

}


// ==================================================
// ADD CLUB
// ==================================================

document
    .getElementById("add-club-button")
    .addEventListener(
        "click",
        function () {

            document
                .getElementById(
                    "club-modal-title"
                )
                .textContent =
                "Add Club";


            document
                .getElementById(
                    "club-form"
                )
                .reset();


            document
                .getElementById(
                    "club-id"
                )
                .value = "";


            document
                .getElementById(
                    "club-recruitment"
                )
                .value = "true";


            document
                .getElementById(
                    "club-modal"
                )
                .classList.add(
                    "show"
                );

        }
    );


// ==================================================
// EDIT CLUB
// ==================================================

async function editClub(clubId) {

    try {

        const response =
            await fetch(
                `http://localhost:5000/api/clubs/${clubId}`
            );


        const club =
            await readResponse(
                response
            );


        if (!club) {
            return;
        }


        document
            .getElementById(
                "club-modal-title"
            )
            .textContent =
            "Edit Club";


        document
            .getElementById(
                "club-id"
            )
            .value =
            club._id;


        document
            .getElementById(
                "club-name"
            )
            .value =
            club.name || "";


        document
            .getElementById(
                "club-category"
            )
            .value =
            club.category || "";


        document
            .getElementById(
                "club-description"
            )
            .value =
            club.description || "";


        document
            .getElementById(
                "club-members"
            )
            .value =
            club.members || 0;


        document
            .getElementById(
                "club-recruitment"
            )
            .value =
            String(
                club.recruitmentOpen
            );


        const deadlineInput =
            document.getElementById(
                "club-deadline"
            );


        /*
         * The HTML date input needs:
         *
         * YYYY-MM-DD
         *
         */


        if (
            club.recruitmentDeadline &&
            /^\d{4}-\d{2}-\d{2}$/.test(
                club.recruitmentDeadline
            )
        ) {

            deadlineInput.value =
                club.recruitmentDeadline;

        } else {

            deadlineInput.value =
                "";

        }


        document
            .getElementById(
                "club-modal"
            )
            .classList.add(
                "show"
            );

    }

    catch (error) {

        console.error(
            "EDIT CLUB ERROR:",
            error
        );


        alert(
            error.message
        );

    }

}


// ==================================================
// SAVE / UPDATE CLUB
// ==================================================

document
    .getElementById("club-form")
    .addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const clubId =
                document
                    .getElementById(
                        "club-id"
                    )
                    .value
                    .trim();


            const clubData = {

                name:
                    document
                        .getElementById(
                            "club-name"
                        )
                        .value
                        .trim(),

                category:
                    document
                        .getElementById(
                            "club-category"
                        )
                        .value
                        .trim(),

                description:
                    document
                        .getElementById(
                            "club-description"
                        )
                        .value
                        .trim(),

                members:
                    Number(
                        document
                            .getElementById(
                                "club-members"
                            )
                            .value
                    ),

                recruitmentOpen:
                    document
                        .getElementById(
                            "club-recruitment"
                        )
                        .value === "true",

                recruitmentDeadline:
                    document
                        .getElementById(
                            "club-deadline"
                        )
                        .value

            };


            console.log(
                "Club ID:",
                clubId
            );


            console.log(
                "Club data:",
                clubData
            );


            if (!clubId) {

                alert(
                    "Club ID is missing. Please close the form and click Edit again."
                );

                return;

            }


            try {

                const response =
                    await fetch(

                        `http://localhost:5000/api/admin/clubs/${clubId}`,

                        {

                            method:
                                "PUT",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${adminToken}`

                            },

                            body:
                                JSON.stringify(
                                    clubData
                                )

                        }

                    );


                const data =
                    await readResponse(
                        response
                    );


                if (!data) {
                    return;
                }


                alert(
                    data.message ||
                    "Club updated successfully!"
                );


                closeClubModal();


                await loadClubs();

            }

            catch (error) {

                console.error(
                    "SAVE CLUB ERROR:",
                    error
                );


                alert(
                    error.message
                );

            }

        }
    );


// ==================================================
// DELETE CLUB
// ==================================================

async function deleteClub(clubId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this club?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(

                `http://localhost:5000/api/admin/clubs/${clubId}`,

                {

                    method:
                        "DELETE",

                    headers: {

                        "Authorization":
                            `Bearer ${adminToken}`

                    }

                }

            );


        const data =
            await readResponse(
                response
            );


        if (!data) {
            return;
        }


        alert(
            data.message
        );


        await loadClubs();

    }

    catch (error) {

        console.error(
            "DELETE CLUB ERROR:",
            error
        );


        alert(
            error.message
        );

    }

}


// ==================================================
// CLOSE CLUB MODAL
// ==================================================

function closeClubModal() {

    document
        .getElementById(
            "club-modal"
        )
        .classList.remove(
            "show"
        );

}


document
    .getElementById(
        "close-club-modal"
    )
    .addEventListener(
        "click",
        closeClubModal
    );


// ==================================================
// LOAD EVENTS
// ==================================================

async function loadEvents() {

    try {

        const response =
            await fetch(
                "http://localhost:5000/api/events"
            );


        const events =
            await readResponse(
                response
            );


        if (!events) {
            return;
        }


        eventCount.textContent =
            events.length;


        eventsContainer.innerHTML = "";


        events.forEach(event => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "management-card";


            card.innerHTML = `

                <div>

                    <h3>
                        ${event.title}
                    </h3>

                    <p>
                        <strong>
                            Club:
                        </strong>

                        ${event.club}
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
                        <strong>
                            Seats:
                        </strong>

                        ${event.seats}
                    </p>

                </div>


                <div class="management-actions">

                    <button
                        type="button"
                        onclick="editEvent('${event._id}')">

                        Edit

                    </button>


                    <button
                        type="button"
                        class="danger-button"
                        onclick="deleteEvent('${event._id}')">

                        Delete

                    </button>

                </div>

            `;


            eventsContainer.appendChild(
                card
            );

        });

    }

    catch (error) {

        console.error(
            "LOAD EVENTS ERROR:",
            error
        );


        eventsContainer.innerHTML = `
            <p>
                ${error.message}
            </p>
        `;

    }

}


// ==================================================
// ADD EVENT
// ==================================================

document
    .getElementById("add-event-button")
    .addEventListener(
        "click",
        function () {

            document
                .getElementById(
                    "event-modal-title"
                )
                .textContent =
                "Add Event";


            document
                .getElementById(
                    "event-form"
                )
                .reset();


            document
                .getElementById(
                    "event-id"
                )
                .value = "";


            document
                .getElementById(
                    "event-modal"
                )
                .classList.add(
                    "show"
                );

        }
    );


// ==================================================
// EDIT EVENT
// ==================================================

async function editEvent(eventId) {

    try {

        const response =
            await fetch(
                `http://localhost:5000/api/events/${eventId}`
            );


        const event =
            await readResponse(
                response
            );


        if (!event) {
            return;
        }


        document
            .getElementById(
                "event-modal-title"
            )
            .textContent =
            "Edit Event";


        document
            .getElementById(
                "event-id"
            )
            .value =
            event._id;


        document
            .getElementById(
                "event-title"
            )
            .value =
            event.title || "";


        document
            .getElementById(
                "event-club"
            )
            .value =
            event.club || "";


        document
            .getElementById(
                "event-category"
            )
            .value =
            event.category || "";


        document
            .getElementById(
                "event-description"
            )
            .value =
            event.description || "";


        document
            .getElementById(
                "event-date"
            )
            .value =
            event.date || "";


        document
            .getElementById(
                "event-time"
            )
            .value =
            event.time || "";


        document
            .getElementById(
                "event-venue"
            )
            .value =
            event.venue || "";


        document
            .getElementById(
                "event-deadline"
            )
            .value =
            event.registrationDeadline || "";


        document
            .getElementById(
                "event-seats"
            )
            .value =
            event.seats || 0;


        document
            .getElementById(
                "event-modal"
            )
            .classList.add(
                "show"
            );

    }

    catch (error) {

        console.error(
            "EDIT EVENT ERROR:",
            error
        );


        alert(
            error.message
        );

    }

}


// ==================================================
// SAVE EVENT
// ==================================================

document
    .getElementById("event-form")
    .addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const eventId =
                document
                    .getElementById(
                        "event-id"
                    )
                    .value
                    .trim();


            const eventData = {

                title:
                    document
                        .getElementById(
                            "event-title"
                        )
                        .value
                        .trim(),

                club:
                    document
                        .getElementById(
                            "event-club"
                        )
                        .value
                        .trim(),

                category:
                    document
                        .getElementById(
                            "event-category"
                        )
                        .value
                        .trim(),

                description:
                    document
                        .getElementById(
                            "event-description"
                        )
                        .value
                        .trim(),

                date:
                    document
                        .getElementById(
                            "event-date"
                        )
                        .value,

                time:
                    document
                        .getElementById(
                            "event-time"
                        )
                        .value
                        .trim(),

                venue:
                    document
                        .getElementById(
                            "event-venue"
                        )
                        .value
                        .trim(),

                registrationDeadline:
                    document
                        .getElementById(
                            "event-deadline"
                        )
                        .value,

                seats:
                    Number(
                        document
                            .getElementById(
                                "event-seats"
                            )
                            .value
                    )

            };


            const url =
                eventId

                ? `http://localhost:5000/api/admin/events/${eventId}`

                : "http://localhost:5000/api/admin/events";


            const method =
                eventId
                ? "PUT"
                : "POST";


            try {

                const response =
                    await fetch(
                        url,
                        {

                            method:
                                method,

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${adminToken}`

                            },

                            body:
                                JSON.stringify(
                                    eventData
                                )

                        }
                    );


                const data =
                    await readResponse(
                        response
                    );


                if (!data) {
                    return;
                }


                alert(
                    data.message
                );


                closeEventModal();


                await loadEvents();

            }

            catch (error) {

                console.error(
                    "SAVE EVENT ERROR:",
                    error
                );


                alert(
                    error.message
                );

            }

        }
    );


// ==================================================
// DELETE EVENT
// ==================================================

async function deleteEvent(eventId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this event?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(

                `http://localhost:5000/api/admin/events/${eventId}`,

                {

                    method:
                        "DELETE",

                    headers: {

                        "Authorization":
                            `Bearer ${adminToken}`

                    }

                }

            );


        const data =
            await readResponse(
                response
            );


        if (!data) {
            return;
        }


        alert(
            data.message
        );


        await loadEvents();

    }

    catch (error) {

        console.error(
            "DELETE EVENT ERROR:",
            error
        );


        alert(
            error.message
        );

    }

}


// ==================================================
// CLOSE EVENT MODAL
// ==================================================

function closeEventModal() {

    document
        .getElementById(
            "event-modal"
        )
        .classList.remove(
            "show"
        );

}


document
    .getElementById(
        "close-event-modal"
    )
    .addEventListener(
        "click",
        closeEventModal
    );


// ==================================================
// LOAD APPLICATIONS
// ==================================================

async function loadApplications() {

    try {

        const response =
            await fetch(
                "http://localhost:5000/api/recruitment/applications",
                {

                    headers: {

                        "Authorization":
                            `Bearer ${adminToken}`

                    }

                }
            );


        const applications =
            await readResponse(
                response
            );


        if (!applications) {
            return;
        }


        applicationCount.textContent =
            applications.length;


        applicationsContainer.innerHTML = "";


        if (applications.length === 0) {

            applicationsContainer.innerHTML = `
                <div class="application-card">

                    <h3>
                        No Applications Yet
                    </h3>

                    <p>
                        No recruitment applications
                        have been submitted.
                    </p>

                </div>
            `;

            return;

        }


        applications.forEach(
            application => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "application-card";


                card.innerHTML = `

                    <h3>
                        ${application.name}
                    </h3>

                    <p>
                        <strong>
                            Club:
                        </strong>

                        ${application.clubName}
                    </p>

                    <p>
                        <strong>
                            Email:
                        </strong>

                        ${application.email}
                    </p>

                    <p>
                        <strong>
                            Course:
                        </strong>

                        ${application.course}
                    </p>

                    <p>
                        <strong>
                            Year:
                        </strong>

                        ${application.year}
                    </p>

                    <p>
                        <strong>
                            Skills:
                        </strong>

                        ${application.skills}
                    </p>

                    <p>
                        <strong>
                            Reason:
                        </strong>

                        ${application.reason}
                    </p>

                    <p>
                        <strong>
                            Status:
                        </strong>

                        ${application.status}
                    </p>

                    <div class="application-actions">

                        <button
                            type="button"
                            onclick="updateApplication(
                                '${application._id}',
                                'Accepted'
                            )">

                            Accept

                        </button>


                        <button
                            type="button"
                            class="danger-button"
                            onclick="updateApplication(
                                '${application._id}',
                                'Rejected'
                            )">

                            Reject

                        </button>

                    </div>

                `;


                applicationsContainer.appendChild(
                    card
                );

            }
        );

    }

    catch (error) {

        console.error(
            "LOAD APPLICATIONS ERROR:",
            error
        );


        applicationsContainer.innerHTML = `
            <div class="application-card">

                <h3>
                    Unable to load applications
                </h3>

                <p>
                    ${error.message}
                </p>

            </div>
        `;

    }

}


// ==================================================
// ACCEPT / REJECT APPLICATION
// ==================================================

async function updateApplication(
    applicationId,
    status
) {

    try {

        const response =
            await fetch(

                `http://localhost:5000/api/recruitment/applications/${applicationId}`,

                {

                    method:
                        "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${adminToken}`

                    },

                    body:
                        JSON.stringify({
                            status: status
                        })

                }

            );


        const data =
            await readResponse(
                response
            );


        if (!data) {
            return;
        }


        alert(
            data.message
        );


        await loadApplications();

    }

    catch (error) {

        console.error(
            "UPDATE APPLICATION ERROR:",
            error
        );


        alert(
            error.message
        );

    }

}


// ==================================================
// START DASHBOARD
// ==================================================

loadClubs();

loadEvents();

loadApplications();
