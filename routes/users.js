/*

 NOTE: Yet again, this code relies heavily on Erno Vanhalas source code from web-applications-week-8 repository

 */


const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const validateToken = require("../auth/tokenVerification");

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

const User = require("../models/User");
const Todo = require("../models/Todo");

const passport = require("passport");
const passport_auth = require("../passport-config");



router.get("/private", validateToken, (req, res, next) => {
    // validateToken(req, res, next);
    return res.status(200).json({ email: req.user.email });
});


router.get("/login", (req, res) => {
    res.render("login");
});


router.post("/todos", validateToken, async (req, res, next) => {
    console.log("Req body: ", req.body);
    console.log("Req user: ", req.user);

    try {
        const found_user_todo = await Todo.find((todo) => todo.user === req.user._id);
        if (found_user_todo) {
            found_user_todo.items.push(req.body.items);
            await found_user_todo.save();
            return res.status(200).send("Items added");

        } else {
            await Todo.create({
                user: req.user._id,
                items: req.body.items
            });
            return res.status(200).send("Items added");
        }
    } catch (err) {
        return res.status(500).send("Internal server error: ", err);
    }
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
        // Even though language server complains, there needs to be await, otherwise the pw check passes with false credentials
        const is_og = await bcrypt.compare(req.body.password, found_user.password);
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
                    console.log("Error:", err);
                    return res.status(400).json({ msg: err });
                }

                return res.status(200).json({ success: true, token: token });
            });
        } else {

            return res.status(400).json({ password: "Password incorrect" });
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
