const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 3000;

// middleware

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lvw8wzq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
   serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
   },
});

async function run() {
   try {
      const database = client.db("bistroDB");
      const usersCollection = database.collection("users");
      const menuCollection = database.collection("menu");
      const cartCollection = database.collection("carts");
      // query for movies that have a runtime less than 15 minutes
      app.get("/menu", async (req, res) => {
         const result = await menuCollection.find({}).toArray();
         res.send(result);
      });

      app.get("/menu/:category", async (req, res) => {
         const category = req.params.category;
         const query = { category: category };
         const result = await menuCollection.find(query).toArray();
         res.send(result);
      });

      app.get("/category", async (req, res) => {
         const menus = await menuCollection.find({}).toArray();
         let result = [];
         menus.forEach((menu) => {
            if (!result.includes(menu.category)) {
               result.push(menu.category);
            }
         });
         res.send(result);
      });

      app.get("/carts", async (req, res) => {
         const email = req.params.email;
         const result = await cartCollection.find({ email: email }).toArray();
         res.send(result);
      });

      app.post("/users", async (req, res) => {
         const user = req.body;
         const query = { email: user.email };
         const existUser = await usersCollection.findOne(query);
         if (existUser) return;

         const result = await usersCollection.insertOne(user);

         res.send(result);
      });

      app.post("/carts", async (req, res) => {
         const cart = req.body;
         const result = await cartCollection.insertOne(cart);
         res.send(result);
      });
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();
      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
   } finally {
      // Ensures that the client will close when you finish/error
      // await client.close();
   }
}
run().catch(console.dir);

app.get("/", (req, res) => {
   res.send("Hello World!");
});

app.listen(port, () => {
   console.log(`Example app listening on port ${port}`);
});
