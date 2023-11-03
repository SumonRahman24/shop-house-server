const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");

// middleware
app.use(cors());
app.use(express.json());

// home apis route
app.get("/", (req, res) => {
  m;
  res.send("server is running...");
});

// mongodb
const uri =
  "mongodb+srv://admin:<password>@shop-house.dwx6xaf.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`server is running successfully at http://${port}`);
});
