// Src: Erno Vanhalas week 7 authentication source codes

const passport = require("passport");

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const dotenv = require("dotenv").config();
const User = require("./models/User");

const params = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: "Kovakoodattuakoskacodegrade",
};

module.exports = (passport) => {
    passport.use(
        new JwtStrategy(params, async (payload, done) => {
            try {
                const user = await User.findById(payload.id);
                console.log("JWTStrat user:", user);
                if (!user) return done(null, false);
                return done(null, user);
            } catch (error) {
                return done(error, false);
            }
        })
    );
}
