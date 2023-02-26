const express = require("express")
    morgan = require("morgan")
    fs = require('fs'), // import built in node modules fs and path 
    path = require('path'); 

const app = express()

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})


//Logging middleware
app.use(morgan('combined', {stream: accessLogStream}))

//serving static files
app.use(express.static('public'))


//Routes
app.get('/', (req, res) => {
    res.send('Welcome to the dev book app!');
});

app.get('/secreturl', (req, res) => {
    res.send('This is a secret url with super top-secret content.');
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

