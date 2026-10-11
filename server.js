const express = require("express");
const { chromium } = require("playwright");

const app = express();

app.use(express.urlencoded({extended:true}));
app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;


app.post("/download", async(req,res)=>{

    const url = req.body.url;

    if(!url){
        return res.send("No URL");
    }


    let browser;


    try{

        browser = await chromium.launch({
            headless:true
        });


        const page = await browser.newPage();


        await page.goto(url,{
            waitUntil:"networkidle",
            timeout:60000
        });


        const video = await page.evaluate(()=>{

            let v = document.querySelector("video");

            return v ? v.src : null;

        });


        await browser.close();


        if(!video){

            return res.send(
                "Video not detected"
            );

        }


        res.redirect(video);



    }catch(e){

        if(browser)
            await browser.close();

        console.log(e);

        res.status(500)
        .send(
            "Error: "+e.message
        );

    }

});


app.listen(PORT,"0.0.0.0",()=>{
    console.log(
        "Running "+PORT
    );
});
