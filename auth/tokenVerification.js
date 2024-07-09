const jwt = require("jsonwebtoken");


function authorization(req, res, next) {
    const auth_head = req.headers["authorization"];

    if (!auth_head) {
        return res.sendStatus(401);
    }
    const token = auth_head.split(" ")[1];
    jwt.verify(token, process.env.SECRET, (err, user) => {
        if (err) {
            return res.status(403);
        }
        req.user = user;
        next();
    });
}

module.exports = authorization;
