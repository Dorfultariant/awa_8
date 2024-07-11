const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

function authorization(req, res, next) {
    const auth_head = req.headers["authorization"];

    console.log("Headers: ", req.headers);
    if (!auth_head) {
        console.log("Authorization head: ", auth_head);
        return res.sendStatus(401);
    }
    const token = auth_head.split(" ")[1];
    jwt.verify(token, process.env.SECRET, (err, user) => {
        console.log("Verification check");
        if (err) {
            return res.status(403);
        }
        req.user = user;
        next();
    });
}

module.exports = authorization;
