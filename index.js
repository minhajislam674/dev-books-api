const express = require("express")
    morgan = require("morgan")
    bodyParser = require("body-parser")
    fs = require('fs'), // import built in node modules fs and path 
    path = require('path'),
    { v4: uuidv4 } = require('uuid');

const { check, validationResult } = require('express-validator');

const bcrypt = require('bcrypt');
const saltRounds = 10;

const {PrismaClient} = require("@prisma/client")
const prisma = new PrismaClient()

// create express app
const app = express()

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

// set cors 
const cors = require('cors');
let allowedOrigins = ['http://localhost:8080', 'http://dev-books.com'];
app.use(cors({
    origin: function(origin, callback){
        // allow requests with no origin
        // (like mobile apps or curl requests)
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1){
            let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
            return callback(new Error(message ), false);
        }
        return callback(null, true);
    }
}));


//Logging middleware
app.use(morgan('combined', {stream: accessLogStream}))

//Body parser middleware
app.use(bodyParser.json());

let auth = require('./auth')(app);
let passport = require('passport');
require('./passport');



//serving static files
app.use(express.static('public'))



//API Routes

// home page
app.get('/', (req, res) => {
    res.send('Welcome to dev-books!!!!!!!!');
});


//get all books
app.get('/books', async (req, res) => {

    const books = await prisma.book.findMany({
        include: { 
            genres: true,
            authors: true
         }
    })
    res.status(200).json(books);
});


//get books by id
app.get('/books/:id', async (req, res) => {
    const {id} = req.params;
    const book = await prisma.book.findUnique({
        where: {
            id: Number(id)
        },
        include: {
            genres: true,
            authors: true
        }
    })
    if(book) {
        res.status(200).json(book);
    } else {
        res.status(404).send('Book not found');
    }
});


//get author by id
app.get('/authors/:authorID', async (req, res) => {
    const {authorID} = req.params;
    const author = await prisma.author.findUnique({
        where: {
            id: Number(authorID)
        },
        include: {
            books: true
        }
    })
    if(author) {
        res.status(200).json(author);
    } else {
        res.status(404).send('Author not found');
    }
});



//register a new user
app.post('/users',

    //validation with express validator
    [
        check('email', 'Email is not valid').isEmail(),
        check('username', 'Username cannot be empty').notEmpty(),
        check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
        check('password', 'Password must be at least 5 chars long and contain one number').isLength({ min: 5 }).matches(/\d/),
        check('password', 'Password cannot be empty').notEmpty()
    ], async (req, res) => {

    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const {email, username, password} = req.body;
    const userExists = await prisma.user.findUnique({
        where: {
            email: email
        }
    })
    if(userExists) {
        res.status(400).send('This user email is taken, choose a different email address');
    } else {
        try {
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const user = await prisma.user.create({
                data: {
                    email: email,
                    username: username,
                    password: hashedPassword
                }
            })
            res.status(201).json(user);
        } catch (error) {
            res.status(500).send('Something went wrong');
        }
    }
});

// delete an existing user
app.delete('/users/:userId',  passport.authenticate('jwt', { session: false }), async (req, res) => {
    const {userId} = req.params;
    const user = await prisma.user.findUnique({
        where: {
            id: Number(userId)
        }
    })
    if(user) {
        await prisma.user.delete({
            where: {
                id: Number(userId)
            }
        })
        res.status(200).send('User deleted successfully');
    } else {
        res.status(404).send('User not found');
    }
});


//Update username by id
app.put('/users/:userId',  passport.authenticate('jwt', { session: false }), async (req, res) => {
    const {userId} = req.params;
    const {username} = req.body;

    const user = await prisma.user.findUnique({
        where: {
            id: Number(userId)
        }
    })

    if(user) {
        const updatedUser = await prisma.user.update({
            where: {
                id: Number(userId)
            },
            data: {
                username: username
            }
        })
        res.status(200).json(updatedUser);
    } else {
        res.status(404).send('User not found');
    }
});


//get all users
app.get('/users', async (req, res) => {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
});

//get user data by id
app.get('/users/:userId',  passport.authenticate('jwt', { session: false }), async (req, res) => {
    const {userId} = req.params;
    const user = await prisma.user.findUnique({
        where: {
            id: Number(userId)
        }
    })
    if(user) {
        res.status(200).json(user);
    } else {
        res.status(404).send('User not found');
    }
});


//add a book to user's book list
app.post('/users/:userId/favorites/:bookId',  passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { userId, bookId } = req.params;
    const user = await prisma.user.findUnique({
        where: {
            id: Number(userId)
        }
    })
    const book = await prisma.book.findUnique({
        where: {
            id: Number(bookId)
        }
    })
    if(user) {
        if(book) {
            //book exists check prisma
            const bookExists = await prisma.user.findFirst({
                where: {
                    id: Number(userId),
                    books: {
                        some: {
                            id: Number(bookId)
                        }
                    }
                }
            })
            
            if(bookExists) {
                res.status(400).send('Book already exists in favorites');
            } else {
                const updatedUser = await prisma.user.update({
                    where: {
                        id: Number(userId)
                    },
                    data: {
                        books: {
                            connect: {
                                id: Number(bookId)
                            }
                        }
                    },
                    include: {
                        books: true
                    }
                })
                res.status(200).json(updatedUser);
            }
        } else {
            res.status(404).send('Book not found');
        }
    } else {
        res.status(404).send('User not found');
    }
});


//delete a book from user's book list
app.delete('/users/:userId/favorites/:bookId',  passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { userId, bookId } = req.params;
    const user = await prisma.user.findUnique({
        where: {
            id: Number(userId)
        }
    })
    const book = await prisma.book.findUnique({
        where: {
            id: Number(bookId)
        }
    })
    if(user) {
        if(book) {
            //book exists check prisma
            const bookExists = await prisma.user.findFirst({ 
                where: {
                    id: Number(userId),
                    books: {
                        some: {
                            id: Number(bookId)
                        }
                    }
                }
            })
            if(bookExists) {
                const updatedUser = await prisma.user.update({
                    where: {
                        id: Number(userId)
                    },
                    data: {
                        books: {
                            disconnect: {
                                id: Number(bookId)
                            }
                        }
                    },
                    include: {
                        books: true
                    }
                })
                res.status(200).json(updatedUser);
            } else {
                res.status(400).send('Book does not exist in favorites');
            }
        } else {
            res.status(404).send('Book not found');
        }
    } else {
        res.status(404).send('User not found');
    }
});



//error handling middlware
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

//Listen for requests
app.listen(8080, () => {
    console.log("Your app is listening on port 8080.")
})