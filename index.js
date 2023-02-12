import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cors from 'cors'
import shortid from 'shortid'


dotenv.config()
const app = express();


const port=process.env.PORT || 8000;
const corsOptions ={
    origin:true,
    Credentials:true,

}
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
  });
  
//database connection
mongoose.set("strictQuery",false);
const connect=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL,
            {
                useNewUrlParser:true,
                useUnifiedTopology:true
            })

            console.log('MongoDb database connected')
    } catch(err){
        console.log(err)
      console.log('MongoDB database connection failed')
    }
}

app.get("/",(req,res)=>{
    res.send("api is working good")
})


app.use(express.json());
app.use(cors(corsOptions));


const URL = mongoose.model("URL", {
  longURL: {
    type: String,
    required: true,
  },
  shortURL: {
    type: String,
    required: true,
    default: shortid.generate,
  },
});

//create url

app.post("/api/urlshortener", async (req, res) => {
  try {
    const { longURL } = req.body;
    const url = new URL({ longURL });
    await url.save();
    res.send({ shortURL: url.shortURL });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

//get url
app.get("/:shortURL", async (req, res) => {
    try {
      const url = await URL.findOne({ shortURL: req.params.shortURL });
      if (!url) {
        return res.status(404).send({ error: "URL not found" });
      }
      return res.send({ longURL: url.longURL });
    } catch (error) {
      return res.status(500).send({ error: "An error occurred" });
    }
  });


app.listen(port,()=>{
    connect();
    console.log('server is listening on port',port)
})