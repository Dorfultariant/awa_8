const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

function authorization(req, res, next) {
    const auth_head = req.headers["authorization"];

    console.log("Headers: ", req.headers);
    console.log("Body:", req.body);

    if (!auth_head) {
        console.log("Authorization head: ", auth_head);
        return res.status(401).send("No authorization");
    }
    const token = auth_head.split(" ")[1];
    jwt.verify(token, "Kovakoodattuakoskacodegrade", (err, user) => {
        console.log("Verification check");
        if (err) {
            return res.status(401).send("Invalid token");
        }
        req.user = user;
        next();
    });
}

module.exports = authorization;
