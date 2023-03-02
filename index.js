const express = require("express")
    morgan = require("morgan")
    bodyParser = require("body-parser")
    fs = require('fs'), // import built in node modules fs and path 
    path = require('path'),
    { v4: uuidv4 } = require('uuid');

const {PrismaClient} = require("@prisma/client")
const prisma = new PrismaClient()

// create express app
const app = express()

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

//Logging middleware
app.use(morgan('combined', {stream: accessLogStream}))

//Body parser middleware
app.use(bodyParser.json())

//serving static files
app.use(express.static('public'))



//API Routes

// Home page
app.get('/', (req, res) => {
    res.send('Welcome to dev-books!!!!!!!!');
});


//get all books
app.get('/books', async (req, res) => {

    const books = await prisma.book.findMany({
        include: { genre: true }
    })
    res.status(200).json(books);
});


//get books by id

app.get('/books/:id', async (req, res) => {
    const {id} = req.params;
    const book = await prisma.book.findUnique({
        where: {
            id: Number(id)
        }
    })

    if(book) {
        res.status(200).json(book);
    } else {
        res.status(404).send('Book not found');
    }
});


//get author by name
app.get('/books/authors/:authorName', (req, res) => {
    const {authorName} = req.params;
    const author = books.find(book => book.author.name === authorName).author;

    if(author) {
        res.status(200).json(author);
    } else {
        res.status(404).send('Author not found');
    }
});


//add a new user using prisma
app.post('/users', async (req, res) => {
    const {name, email, password} = req.body;
    const userExists = await prisma.user.findUnique({
        where: {
            email: email
        }
    })
    
    if(userExists) {
        res.status(400).send('This user email is taken, choose a different email address');
    } else {
        const user = await prisma.user.create({
            data: {
                name: name,
                email: email,
                password: password
            }
        })
        res.status(201).json(user);
    }
});

// delete an existing user
app.delete('/users/:id', async (req, res) => {
    const {id} = req.params;
    const user = await prisma.user.findUnique({
        where: {
            id: Number(id)
        }
    })
    if(user) {
        await prisma.user.delete({
            where: {
                id: Number(id)
            }
        })
        res.status(200).send('User deleted successfully');
    } else {
        res.status(404).send('User not found');
    }
});


//Update username by id and verify if new username already exists
app.put('/users/:id', (req, res) => {
    const {id} = req.params;
    const {username} = req.body;
    const user = users.find(user => user.id === id);

    if(user) {
        const userExists = users.find(user => user.username === username);
        if(userExists) {
            res.status(400).send('This username is taken, choose a different username');
        } else {
            user.username = username;
            res.status(200).json(user);
        }
    } else {
        res.status(404).send('User not found');
    }
});


//get all users with prisma
app.get('/users', async (req, res) => {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
});

//get user data by username
app.get('/users/:username', (req, res) => {
    const {username} = req.params;
    const user = users.find(user => user.username === username);

    if(user) {
        res.status(200).json(user);
    } else {
        res.status(404).send('User not found');
    }
});

//get user's favorite books by username
app.get('/users/:username/favorites', (req, res) => {
    const {username} = req.params;
    const user = users.find(user => user.username === username);

    if(user) {
        res.status(200).json(user.favoriteBooks);
    } else {
        res.status(404).send('User not found');
    }
});

//add a book to user's favorite books

app.post('/users/:userId/favorites/:bookId', (req, res) => {
    const { userId, bookId } = req.params;
    const user = users.find(user => user.id === userId);
    const book = books.find(book => book.id === bookId).id;

    if(user) {
        if(book) {
            const bookExists = user.favoriteBooks.find(book => book === bookId);
            if(bookExists) {
                res.status(400).send('Book already exists in favorites');
            } else {
                user.favoriteBooks.push(book);
                res.status(201).json(user.favoriteBooks);
            }

        } else {
            res.status(404).send('Book not found');
        }
    } else {
        res.status(404).send('User not found');
    }
});

//delete a book from user's favorite books
app.delete('/users/:userId/favorites/:bookId', (req, res) => {
    const { userId, bookId } = req.params;
    const user = users.find(user => user.id === userId);
    const book = books.find(book => book.id === bookId).id;

    if(user) {
        if(book) {
            const bookExists = user.favoriteBooks.find(book => book === bookId);
            if(bookExists) {
                user.favoriteBooks = user.favoriteBooks.filter(id => id !== bookId);
                res.status(200).json(user.favoriteBooks);
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

