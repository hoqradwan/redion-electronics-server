const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4b1x8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const run = async () => {
  try {
    await client.connect();
    console.log("connected");
    const productCollection = client
      .db("redionElectronics")
      .collection("products");

      app.get('/products', async(req, res) =>{
          const query = {};
          const cursor = productCollection.find(query);
          const products = await cursor.toArray();
          res.send(products)
      })
  } finally {
  }

  // perform actions on the collection object
};
run();

app.get("/", (req, res) => {
  res.send("Hey bro, How are you!!");
});
app.listen(port, () => {
  console.log("server is running");
});
