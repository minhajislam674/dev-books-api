const express = require("express")
    morgan = require("morgan")
    bodyParser = require("body-parser")
    fs = require('fs'), // import built in node modules fs and path 
    path = require('path'),
    { v4: uuidv4 } = require('uuid');

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

let books = [
    {   
        "id": "1",
        "title": "Clean Code",
        "author": {
            "name": "Robert C. Martin",
            "bio": "Robert Cecil Martin, commonly called Uncle Bob, is a software engineer, advocate of Agile development methods, and President of Object Mentor Inc. Martin and his team of software consultants use Object-Oriented Design, Patterns, UML, Agile Methodologies, and eXtreme Programming with worldwide clients.",
            "image": "https://images.gr-assets.com/authors/1490470967p8/45372.jpg"
        },
        "description": "Clean Code: A Handbook of Agile Software Craftsmanship is a software development book by Robert C. Martin, published in 2008. It is a guide on software craftsmanship and how to write code that can be understood by humans. It is a sequel to Martin's 2000 book Agile Software Development, and is part of the Agile Manifesto.",
        "image": "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1436202607i/3735293.jpg",
        "genres": ["Coding", "Programming", "Computer Science", "Software"],
        "publishDate": "2007"
    },
    {   
        "id": "2",
        "title": "The Pragmatic Programmer",
        "author": {
            "name": "Andrew Hunt",
            "bio": "Andrew Hunt is a software developer, author, and speaker. He is the co-author of The Pragmatic Programmer: From Journeyman to Master, a book on software development, and co-author of Pragmatic Version Control Using Subversion, a book on version control. He is also the co-author of Pragmatic Thinking and Learning: Refactor Your Wetware, a book on learning and thinking.",
            "image": "https://images.gr-assets.com/authors/1327862044p8/10372.jpg"
        },
        "description": "The Pragmatic Programmer: From Journeyman to Master is a book about software craftsmanship and how to be a better programmer. It was written by Andy Hunt and Dave Thomas, and published in 1999 by Addison-Wesley. The book is a sequel to their earlier book, The Pragmatic Programmer.",
        "image": "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1436202607i/4099.jpg",
        "genres": ["Coding", "Programming", "Computer Science", "Software"],
        "publishDate": "1999"
    },
    {   
        "id": "3",
        "title": "The Clean Coder",
        "author": {
            "name": "Robert C. Martin",
            "bio": "Robert Cecil Martin, commonly called Uncle Bob, is a software engineer, advocate of Agile development methods, and President of Object Mentor Inc. Martin and his team of software consultants use Object-Oriented Design, Patterns, UML, Agile Methodologies, and eXtreme Programming with worldwide clients.",
            "image": "https://images.gr-assets.com/authors/1490470967p8/45372.jpg"
        },
        "description": "The Clean Coder: A Code of Conduct for Professional Programmers is a book by Robert C. Martin, published in 2008. It is a sequel to his 2008 book Clean Code: A Handbook of Agile Software Craftsmanship. The book is part of the Agile Manifesto.",
        "image": "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1436202607i/3735296.jpg",
        "genres": ["Coding", "Programming", "Computer Science", "Software"],
        "publishDate": "2008"
    }
]

let users = [
    {
        id: "1",
        username: "user1",
        favoriteBooks: []
    },
    {
        id: "2",
        username: "user2",
        favoriteBooks: []
    },
    {
        id: "3",
        username: "user3",
        favoriteBooks: ["3"]
    }
]


//API Routes

// Home page
app.get('/', (req, res) => {
    res.send('Welcome to dev-books!!!!!!!!');
});


//get all books
app.get('/books', (req, res) => {
    res.status(200).json(books);
});

//get books by id
app.get('/books/:title', (req, res) => {
    const {title} = req.params;
    const book = books.find(book => book.title === title);

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


//add a new user
app.post('/users', (req, res) => {
    const {username} = req.body;
    const user = users.find(user => user.username === username);

    if(user) {
        res.status(400).send('User already exists');
    } else {
        const newUser = {
            id: uuidv4(),
            username,
            favoriteBooks: []
        }
        users.push(newUser);
        res.status(201).json(newUser);
    }
});

// delete an existing user

app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    const user = users.find(user => user.id === id);

    if(user) {
        users = users.filter(user => user.id !== id);
        res.json(users)
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


//get all users
app.get('/users', (req, res) => {
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

