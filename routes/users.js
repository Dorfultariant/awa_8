/*

 NOTE: Yet again, this code relies heavily on Erno Vanhalas source code from web-applications-week-8 repository

 */


const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const fs = require("fs");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const validateToken = require("../auth/tokenVerification");

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

const User = require("../models/User");

const passport = require("passport");
const passport_auth = require("../passport-config");

let users = [];
const mongodb_url = "mongodb://127.0.0.1:27017/testdb";


fs.readFile("./data/users.json", "utf-8", (err, data) => {
    if (err) {
        console.error("Something wrong with db:", err);
        return;
    }
    users = JSON.parse(data);
    console.log("Loaded data\n", users);
});

router.get("/private", (req, res, next) => {
    if (validateToken(req, res, next)) {
        return res.status(200).json({ email: req.body.email });
    }
});


router.get("/login", (req, res) => {
    res.render("login");
});



router.post("/login", async (req, res, next) => {
    try {
        const found_user = await User.findOne({ email: req.body.email });
        if (found_user === null) {
            return res.status(403).json({ email: "Could not find user" });
        }

        if (found_user.length === 0) {
            return res.status(403).json({ email: "Could not find user" });
        }
        const is_og = bcrypt.compare(req.body.password, found_user.password);
        console.log(is_og);
        if (is_og) {

            const payload = {
                id: found_user._id,
                email: req.body.email
            }

            console.log("Payload: ", payload);
            jwt.sign(payload, "Kovakoodattuakoskacodegrade", (err, token) => {
                console.log("Signed token: ", token);
                if (err) {
                    return res.status(400).json({ msg: err });
                }

                return res.status(200).json({ success: true, payload: req.body.email, token: token });

            });

        }
    } catch (err) {
        console.error("Error while login:", err);
        res.status(500).send("Internal Server Error");
    }
});


router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/register",
    body("email").trim().isEmail().withMessage("Not valid email"),
    body("password").isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minSymbols: 1,
        minNumbers: 1
    })
    , async (req, res, next) => {
        try {
            const errors = validationResult(req);
            console.log("Errors from validation result: ", errors);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const found_user = await User.find({ email: req.body.email });
            console.log("What was found: ", found_user);
            if (found_user.length !== 0) {
                return res.status(403).json({ email: "Email already in use." });
            }

            bcrypt.hash(req.body.password, 10, async (err, hashed) => {
                if (err) {
                    res.status(401).send("Could not hash");
                }
                const new_user = {
                    email: req.body.email,
                    password: hashed
                }
                User.create(new_user);
                return res.status(200).json(new_user);
            });
        } catch (err) {
            console.log("Error while register:", err);
            res.status(500).send("internal server error");
        }
    });



module.exports = router;
