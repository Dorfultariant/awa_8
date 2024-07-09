// Src: Erno Vanhalas week 7 authentication source codes

const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByUsername, getUserById) {
    const authenticate_user = async (username, password, done) => {
        const user = getUserByUsername(username)
        if (user == null) {
            return done(null, false)
        }

        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user)
            } else {
                return done(null, false)
            }
        } catch (e) {
            return done(e)
        }

    }

    passport.use(new LocalStrategy(authenticate_user))
    passport.serializeUser((user, done) => done(null, user._id))
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id))
    })
}

module.exports = initialize
