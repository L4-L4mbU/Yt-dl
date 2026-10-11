const express = require("express");
const ytdlp = require("yt-dlp-exec");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const PORT = 10000;

app.post("/convert", async (req, res) => {

    const url = req.body.url;

    if (!url) {
        return res.send("No URL");
    }

    const output = `audio-${Date.now()}.mp3`;

    try {

        await ytdlp(url, {
            extractAudio: true,
            audioFormat: "mp3",
            output: output,
            audioQuality: 0
        });

        res.download(output, () => {
            fs.unlinkSync(output);
        });

    } catch (err) {

        console.log(err);
        res.status(500).send("Conversion failed");

    }

});


app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on ${PORT}`);
});
