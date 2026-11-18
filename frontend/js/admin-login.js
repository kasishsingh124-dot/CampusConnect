const loginForm =
    document.getElementById("admin-login-form");

const loginMessage =
    document.getElementById("login-message");


loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();


    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;


    loginMessage.textContent = "Logging in...";
    loginMessage.style.color = "black";


    try {

        const response = await fetch(
            "http://localhost:5000/api/admin/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Invalid email or password."
            );

        }
        localStorage.setItem(
            "adminToken",
            data.token
        );
        loginMessage.textContent =
            "Login successful!";

        loginMessage.style.color =
            "green";
        setTimeout(() => {

            window.location.href =
                "admin.html";

        }, 500);


    } catch (error) {

        console.error(
            "Admin login error:",
            error
        );


        loginMessage.textContent =
            error.message;

        loginMessage.style.color =
            "red";

    }

});