document.addEventListener("DOMContentLoaded", async () => {

    const forminfo = document.getElementById("register-form");

    forminfo.addEventListener("submit", sendCredentials);
});


async function sendCredentials(event) {
    event.preventDefault();
    const form = new FormData(event.target);

    try {
        const res = await fetch("/api/user/register", {
            method: "post",
            body: form
        });

        if (res.ok) {
            const data = await res.json();
            console.log(data);
        }
    } catch (err) {
        console.log("Error:", err);
    }
}

