const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log(authHeader);
 /*  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  } */
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
   /*  if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    } */
    console.log("decoded", decoded);
    req.decoded = decoded;
    next();
  });
}

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
    const itemsCollection = client.db("redionElectronics").collection("items");
    // AUTH
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });
    // GET products
    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    });

    // POST
    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    });
    // PUT
    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const updatedProduct = req.body;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          quantity: parseInt(updatedProduct.quantity),
        },
      };
      const result = await productCollection.updateOne(
        query,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // DELETE
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });

    // items collection API
    app.get(
      "/items",
      verifyJWT,
      async (req, res) => {
        const decodedEmail = req.decoded.email;
        const email = req.query.email;
        if (email === decodedEmail) {
          const query = { email: email };
          const cursor = itemsCollection.find(query);
          const items = await cursor.toArray();
          res.send(items);
        }
        else{
          res.status(403).send({message: 'forbidden access'})
        }
        // const query = {};
      }
    );

    // POST items
    app.post("/items", async (req, res) => {
      const item = req.body;
      const result = await itemsCollection.insertOne(item);
      res.send(result);
    });

    // DELETE
    app.delete("/items/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await itemsCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
};

run();

app.get("/", (req, res) => {
  res.send("Hey bro, How are you!!");
});
app.listen(port, () => {
  console.log("server is running");
});
