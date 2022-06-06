const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 3000;
const MongoClient = require("mongodb").MongoClient;
const dotenv = require("dotenv");

dotenv.config();

const connectionString = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.oical.mongodb.net/?retryWrites=true&w=majority`;

MongoClient.connect(connectionString).then((client) => {
  console.log("Connected to Database");
  const db = client.db("quotes-app");
  const quotesCollection = db.collection("quotes");
  app.set("view engine", "ejs");
  // Make sure you place body-parser before your CRUD handlers!
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.static("public"));
  app.use(bodyParser.json());

  app.get("/", (req, res) => {
    quotesCollection
      .find()
      .toArray()
      .then((results) => {
        res.render("index.ejs", { quotes: results });
        console.log(results);
      })
      .catch((error) => console.error(error));

    //res.sendFile(__dirname + "/index.html");
  });

  app.post("/quotes", (req, res) => {
    quotesCollection
      .insertOne(req.body)
      .then((result) => {
        res.redirect("/");
      })
      .catch((error) => console.error(error));
  });

  app.put("/quotes", (req, res) => {
    quotesCollection
      .findOneAndUpdate(
        { name: "Nelson mandela" },
        {
          $set: {
            name: req.body.name,
            quote: req.body.quote,
          },
        },
        {
          upsert: true,
        }
      )
      .then((result) => {
        res.json("success");
        //console.log(result);
      })
      .catch((error) => console.error(error));
  });

  app.delete("/quotes", (req, res) => {
    quotesCollection
      .deleteOne({ name: req.body.name })
      .then((result) => {
        if (result.deletedCount === 0) {
          return res.json("No quote to delete");
        } else {
          res.json(`Deleted Ruth's quote`);
        }
      })
      .catch((error) => console.error(error));
  });

  app.listen(process.env.PORT || PORT, () => {
    console.log("Listening at port 3000");
  });
});
