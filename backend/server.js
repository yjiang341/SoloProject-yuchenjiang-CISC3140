const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

//middle ware
app.use(cors());
app.use(express.json());

app.get("/api/test", (req, res) => {
    res.json({
        message: "Hello World!",
        value: 42
    });
});

app.get("/", (req, res) => {
    res.send("Welcome to the server");
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
})