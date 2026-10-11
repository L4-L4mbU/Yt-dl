const express = require("express");
const ytdlp = require("yt-dlp-exec");
const fs = require("fs");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));


const PORT = process.env.PORT || 3000;


app.post("/download", async (req,res)=>{

    const url = req.body.url;

    if(!url){
        return res.send("No URL");
    }


    const file = `audio_${Date.now()}.mp3`;


    try{

        console.log("Downloading:",url);


        await ytdlp(url,{
            extractAudio:true,
            audioFormat:"mp3",
            output:file,
            audioQuality:0
        });


        res.download(file,"audio.mp3",()=>{

            fs.unlink(file,()=>{});

        });


    }catch(error){

        console.log(error);

        res.status(500)
        .send("Conversion failed");

    }

});


app.listen(PORT,"0.0.0.0",()=>{

    console.log("Running on port "+PORT);

});
