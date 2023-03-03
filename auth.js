const jwtSecret = 'your_jwt_secret'; // This has to be the same key used in the JWTStrategy
const jwt = require('jsonwebtoken'),
  passport = require('passport');
const bcrypt = require('bcrypt');
  
require('./passport'); // Your local passport file

let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.email, // This is the email we’re encoding in the JWT
        expiresIn: '7d', // This specifies that the token will expire in 7 days
        algorithm: 'HS256' // This is the algorithm used to “sign” or encode the values of the JWT
    });
    }

/* POST login. */
module.exports = (router) => {
    router.post('/login', async (req, res) => {

        passport.authenticate('local', {session: false}, async (error, user, info) => {
            if (error || !user) {
                return res.status(400).json({
                    message: 'Something is not right',
                    user: user,
                    error: error,
                    info: info
                });
            }

            // compare the provided password with the hashed password stored in the database
            try {
                const isMatch = await bcrypt.compare(req.body.password, user.password);
                if (!isMatch) {
                    return res.status(400).json({
                        message: 'Something is not right',
                        user: user,
                        error: error,
                        info: info
                    });
                }

                req.login(user, {session: false}, (error) => {
                    if(error) {
                        res.send(error) 
                    }
                    let token = generateJWTToken(user);
                    return res.json({user, token});
                });

            } catch (error) {
                console.error(error);
                return res.status(500).json({
                    message: 'Internal server error',
                    user: null,
                    error: error.message,
                    info: null
                });
            }
        })(req, res);
    });
}
