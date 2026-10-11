const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;


app.post("/download", async (req, res) => {

    const url = req.body.url;

    if (!url) {
        return res.send("No URL");
    }

    try {

        const response = await axios.get(url, {
            headers: {
                "User-Agent":
                "Mozilla/5.0"
            }
        });


        const html = response.data;

        const $ = cheerio.load(html);


        let video =
$('meta[property="og:video:secure_url"]').attr("content") ||
$('meta[property="og:video"]').attr("content") ||
$('meta[name="twitter:player:stream"]').attr("content");

        if (!video) {
    console.log(html.substring(0,2000));
    return res.send("No video metadata found");
        }


        const videoData = await axios.get(video, {
            responseType: "stream"
        });


        res.setHeader(
            "Content-Disposition",
            "attachment; filename=reel.mp4"
        );

        res.setHeader(
            "Content-Type",
            "video/mp4"
        );


        videoData.data.pipe(res);


    } catch(error) {

        console.log(error);
        res.status(500).send(
            "Failed to download"
        );

    }

});


app.listen(PORT,"0.0.0.0",()=>{

    console.log(
        "Running on port "+PORT
    );

});
