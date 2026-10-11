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
        return res.send("Missing URL");
    }


    try {

        console.log("Fetching:", url);


        const response = await axios.get(url, {

            headers: {

                "User-Agent":
                "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36",

                "Accept-Language":
                "en-US,en;q=0.9"

            }

        });


        const html = response.data;


        let video = null;


        // Method 1: JSON-LD
        const jsonMatch = html.match(
            /<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/
        );


        if (jsonMatch) {

            try {

                const json =
                JSON.parse(jsonMatch[1]);

                video = json.contentUrl;

            } catch(e) {

                console.log("JSON-LD failed");

            }

        }



        // Method 2: og video
        if (!video) {

            const $ = cheerio.load(html);

            video =
            $('meta[property="og:video"]').attr("content") ||
            $('meta[property="og:video:secure_url"]').attr("content");

        }



        // Method 3: search mp4 directly
        if (!video) {

            const mp4 =
            html.match(
                /https?:\/\/[^"']+\.mp4[^"']*/g
            );

            if (mp4) {

                video = mp4[0]
                    .replace(/\\u0026/g,"&")
                    .replace(/\\u002F/g,"/");

            }

        }



        if (!video) {

            console.log(
                html.substring(0,2000)
            );

            return res.send(
                "Video URL not found"
            );

        }



        console.log(
            "Video URL:",
            video
        );



        const videoStream =
        await axios.get(video, {

            responseType:"stream",

            headers:{
                "User-Agent":
                "Mozilla/5.0"
            }

        });



        res.setHeader(
            "Content-Disposition",
            "attachment; filename=reel.mp4"
        );


        res.setHeader(
            "Content-Type",
            "video/mp4"
        );


        videoStream.data.pipe(res);



    } catch(error) {


        console.log(error.message);


        res.status(500)
        .send(
            "Failed: "+error.message
        );


    }


});



app.listen(
    PORT,
    "0.0.0.0",
    ()=>{

        console.log(
            "Running on port "+PORT
        );

    }
);
