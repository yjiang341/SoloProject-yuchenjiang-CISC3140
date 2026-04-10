const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

// *** middle ware ***
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// *** Fetching data from database/APIs ***
app.get("/", async (req, res) => {
    try {
        const data = await fetch(
            "https://pokeapi.co/api/v2/pokemon/2"
        );

        const myPage = await data.json();

        res.json({
            message: "Hello from server",
            pokemon: myPage
        });

    } catch (error) {
        res.status(404).send("Not Found");
    }
});

/*
app.get("/api/test", (req, res) => {
    res.json({
        message: "Hello World!",
        value: 42
    });
});
*/

/*
app.get("/", (req, res) => {
    res.send("Hello World!");
})
*/

//*** PORT Settings ***
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
})