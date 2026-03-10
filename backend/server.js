const express = require("express");
require("dotenv").config();
const app = express();

app.get("/", (req, res) => {
    res.send("Welcome to the server");
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
})