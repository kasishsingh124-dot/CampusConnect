const form =
    document.getElementById(
        "student-login-form"
    );

const message =
    document.getElementById(
        "login-message"
    );


form.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const email =
            document.getElementById(
                "email"
            ).value;


        const password =
            document.getElementById(
                "password"
            ).value;


        if (!email || !password) {

            message.textContent =
                "Please enter email and password.";

            message.style.color =
                "red";

            return;

        }


        /*
            Student authentication will be
            connected to MongoDB later.
        */

        window.location.href =
            "index.html";

    }
);