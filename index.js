const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());

// middlewares
const logger = (req, res, next) => {
  console.log("mylogger = ", req.host, req.originalUrl);
  next();
};

const verrifyToken = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.satus(401).send({ message: "unauthorized" });
  }
  jwt.verify(token, process.env.ACACCESS_TOKEN_SECRECT, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized" });
    }

    console.log("decoded =", decoded);
    req.user = decoded;
  });

  next();
};

// mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@shop-house.dwx6xaf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const dbConnect = async () => {
  try {
    client.connect();
    console.log("DB Connected Successfully✅");
  } catch (error) {
    console.log(error.name, error.message);
  }
};
dbConnect();

const productsCollection = client.db("shopHouseDB").collection("products");
const cartCollection = client.db("shopHouseDB").collection("carts");

// jwt auth apis route
app.post("/jwt", (req, res) => {
  //get user
  const user = req.body;
  console.log("user of token", user);

  // create token
  const token = jwt.sign(user, process.env.ACACCESS_TOKEN_SECRECT, {
    expiresIn: "24h",
  });

  // store token
  res
    .cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .send({ success: true });
});

app.post("/logout", (req, res) => {
  //get user
  const user = req.body;
  console.log("logout user =", user);
  //clean cookie in client
  res.clearCookie("token", { maxAge: 0 }).send({ success: true });
});

// products apis route
app.get("/products", async (req, res) => {
  const page = parseInt(req.query.page);
  const size = parseInt(req.query.size);
  console.log({ page }, { size });

  const result = await productsCollection
    .find()
    .skip(page * size)
    .limit(size)
    .toArray();
  res.send(result);
});

app.get("/products/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const options = {
    projection: { product_name: 1, price: 1 },
  };
  const result = await productsCollection.findOne(query, options);
  res.send(result);
});

app.get("/productsCount", async (req, res) => {
  const count = await productsCollection.estimatedDocumentCount();
  res.send({ count });
});

// cart apis route
app.post("/cart", async (req, res) => {
  const productCartInfo = req.body;
  const result = await cartCollection.insertOne(productCartInfo);
  res.send(result);
});

app.get("/cart", async (req, res) => {
  const result = await cartCollection.find().toArray();
  res.send(result);
});

// home apis route
app.get("/", (req, res) => {
  res.send("server is running...");
});

app.listen(port, () => {
  console.log(`server is running successfully at http://${port}`);
});
