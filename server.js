const express = require("express")
const app = express()
const path = require('path')
const fs = require("fs")
let db = require("./db/db")



// set PORT as whatever is in the environment variable PORT (in heroku), or 3000 if there's nothing there
const PORT = process.env.PORT || 3000

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')));


// Basic route that sends the user to the AJAX Page
app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "./public/index.html"))
})
app.get("/notes", function (req, res) {
    res.sendFile(path.join(__dirname, "./public/notes.html"))
})

// Display notes in the database on notes.html
app.get("/api/notes", function (req, res) {
    res.json(db)
})

// Add a new note from notes.html into the database 
app.post("/api/notes", function (req, res) {
    //add the new note into the database
    db.push(req.body)
    //update the database
    fs.writeFile("./db/db.json", JSON.stringify(db), (err) => {
        if (err) throw err;
    });
    res.end()
})


//Delete a specific note pointed by ID from database 
app.delete("/api/notes/:id", function (req, res) {
    const id = req.params.id
    db = db.filter(note => note.id != id);
    fs.writeFile("./db/db.json", JSON.stringify(db), (err) => {
        if (err) throw err;
    });
    res.end()
})

//Edit a specific note pointed by ID from database 
app.put("/api/notes/:id", function (req, res) {
    //find the note to update based on id
    const note = db.find((note) => note.id === req.params.id);
    const index = db.indexOf(note);
//update the note in database
    const updatedNote = {
        ...note,
        ...req.body
    };
    db[index] = updatedNote;
    res.end();
})



app.listen(PORT, () => console.log(`Server listening on PORT: ${PORT}`))