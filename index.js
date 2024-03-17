const express = require("express");

const path=require('path');
const { connectToMongoDB } = require("./connect");

const urlRoute = require("./routes/url");

const staticRoute=require('./routes/staticRouter');
const URL = require("./models/url");

const app = express();



const PORT = 8001;

// seting view engine....


connectToMongoDB("mongodb://localhost:27017/short-url").then(() =>
  console.log("Mongodb connected")
);

app.set("view engine","ejs");
app.set("views",path.resolve("./views"));
app.use(express.json());
app.use(express.urlencoded({extended:false}));


app.use("/url", urlRoute);

app.use("/",staticRoute);

// server side rendering ........................


//here we are doing server side rendering.............
app.get("/text",async(req,res)=>
{
  // return res.end('<h1>Hey from server </h1>')
  // return res.end('<h1> hello bro </h1>');
  const alluser=await URL.find({});
  // return res.json(alluser);
  return res.render('home',{  // we can pass parameter over here
    urls:alluser,
  });

})

// getting the all short url.....

// app.get("/text",async(req,res)=>
// {
//   const allUrls=await URL.find({});
//   return res.end(`
//    ${allUrls.map(url=>
    
//         `${url.shortId} - ${url.redirectURL} -${url.visitHistory.length} \n`).join("")}
//   `)
// })


app.get("/url/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const entry = await URL.findOneAndUpdate(
    {
      shortId,
    },
    {
      $push: {
        visitHistory: {
          timestamp: Date.now(),
        },
      },
    }
  );
  if (entry && entry.redirectURL) {
    res.redirect(entry.redirectURL);
  } else {
    // Handle the case when entry is null or redirectURL is not available
    res.status(404).send("URL not found");
  }
});

app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));
