const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  passportJWT = require('passport-jwt');

const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const {PrismaClient} = require("@prisma/client")
const prisma = new PrismaClient()


//Setting up basic HTTP authentication for login requests
passport.use(
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        async (email, password, done) => {
            console.log('Received credentials:', email, password);
            try {
                const user = await prisma.user.findUnique({
                    where: {
                        email: email
                    }
                });
                console.log('Found user:', user);
                if (!user) {
                    return done(null, false, {message: 'Incorrect email.'});
                }
                return done(null, user, {message: 'Logged In Successfully'});
            } catch (err) {
                console.error(err);
                done(err);
            }
        }
    )
);

//Setting up the JWT authentication code
passport.use(
    new JWTStrategy(
        {
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'your_jwt_secret'
        },
        async (jwtPayload, callback) => {
            try {
                const user = await prisma.user.findUnique({
                    where: {
                        id: jwtPayload.id
                    }
                });
                return callback(null, user);
            } catch (err) {
                return callback(err);
            }
        }
    )
);
