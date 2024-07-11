const createError = require('http-errors');
const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const mongoose = require("mongoose");
const passport = require("passport");

require("./passport-config")(passport);


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

app.use(express.static("public"));
// needs to be added, so req.body can be parsed properly, this has taken too much debugging hours already
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const mongoDB = "mongodb://127.0.0.1:27017/testdb";
mongoose.connect(mongoDB);

mongoose.Promise = Promise;
const db = mongoose.connection;

db.on("error", console.error.bind(console, "Oh no! MongoDB connection error: "));
db.on("connected", () => {
    console.log("MongoDB connected...");
});

app.use(passport.initialize());

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.use((req, res, next) => {
    console.log("Logging information:");
    console.log("Body: ", req.body);
    next();
});

app.use('/', indexRouter);
app.use("/api", usersRouter);
app.use('/api/user', usersRouter);


module.exports = app;
