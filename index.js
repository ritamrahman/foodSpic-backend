const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.twtll.mongodb.net/?retryWrites=true&w=majority`;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rdsosof.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// middleware
// function verifyJWT(req, res, next) {
//   const authHeader = req.headers.authorization;

//   if (!authHeader) {
//     return res.status(401).send({ message: "unauthorized access" });
//   }
//   const token = authHeader.split(" ")[1];

//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
//     if (err) {
//       return res.status(403).send({ message: "Forbidden access" });
//     }
//     req.decoded = decoded;
//     next();
//   });
// }

async function run() {
  try {
    const kitchenCollection = client.db("Kitchen").collection("allKitchen");
    const reviewCollection = client.db("reviews").collection("reviews");

    // ---Reviews---
    // post review
    app.post("/submitreview/:id", async (req, res) => {
      const id = req.params.id; //get kitchen _id
      const query = { _id: ObjectId(id) };
      const kitchen = await kitchenCollection.findOne(query); //find desire kitchen

      const kitchenId = kitchen._id;
      const kitchenName = kitchen.kitcheNname;

      const review = req.body; //get review from body
      const dateWhenCreated = Date(); //create date

      const result = await reviewCollection.insertOne({ ...review, kitchenId, kitchenName, dateWhenCreated });

      res.send(result);
    });

    // Get All Review By Kitchen id
    app.get("/kitchenreview/:id", async (req, res) => {
      let id = req.params.id; //get kitchen _id
      const query = { kitchenId: ObjectId(id) };
      const cursor = reviewCollection.find(query);

      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    // Get My All Reviews
    app.get("/myreviews/:email", async (req, res) => {
      let email = req.params.email; //get kitchen _id
      const query = { userEmail: email };
      const cursor = reviewCollection.find(query);

      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    // ---Kitchen---
    // addkitchen;
    app.post("/addkitchen", async (req, res) => {
      const kitchen = req.body;
      const dateWhenCreated = Date();
      // const kitchenWithDate = { kitchen, dateWhenCreated };
      const result = await kitchenCollection.insertOne({ ...kitchen, dateWhenCreated });
      res.send(result);
      // res.send("addkitchen route working");
    });

    // allkitchen for Home route
    app.get("/topKitchens", async (req, res) => {
      const query = {};
      const cursor = kitchenCollection.find(query).limit(3);
      const kitchens = await cursor.toArray();
      res.send(kitchens);
    });

    // allkitchen;
    app.get("/allkitchens", async (req, res) => {
      const query = {};
      const cursor = kitchenCollection.find(query);
      const kitchens = await cursor.toArray();
      res.send(kitchens);
    });

    // Single Kitchen
    app.get("/kitchen/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const kitchen = await kitchenCollection.findOne(query);
      res.send(kitchen);
    });

    // app.patch("/orders/:id", verifyJWT, async (req, res) => {
    //   const id = req.params.id;
    //   const status = req.body.status;
    //   const query = { _id: ObjectId(id) };
    //   const updatedDoc = {
    //     $set: {
    //       status: status,
    //     },
    //   };
    //   const result = await orderCollection.updateOne(query, updatedDoc);
    //   res.send(result);
    // });

    app.delete("/review/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}

run().catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`server running on ${port}`);
});
