var express = require("express");
const bodyParser = require("body-parser");
var MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectID;
var url =
  "mongodb+srv://admin:admin123@cluster0.uttfy.mongodb.net/foodie?retryWrites=true&w=majority";
var app = express();
app.use(express.static("public"));
app.use(express.static("images"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/register.html");
});

var userName = "";
var userPassword = "";
var userAddress = "";

app.post("/addtocart", (req, res) => {
  const body = req.body;
  console.log(body);

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;

    var dbo = db.db("fooddb");
    dbo
      .collection("Cart")
      .insertOne(
        { userName, userPassword, userAddress, body },
        function (err, res) {
          console.log("Item added to cart");
          db.close();
        }
      );
  });
});

app.post("/removeFromCart", (req, res) => {
  const body = req.body;
  console.log(body._id);

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;

    var dbo = db.db("fooddb");
    dbo
      .collection("Cart")
      .deleteOne({ _id: ObjectId(body._id) }, function (err, result) {
        console.log("Deleted Item is " + result._id);
        db.close();
        console.log("Before Redirect");
        // res.sendFile(__dirname + "/cartdetails")

        console.log("After redirect");
      });
  });
});

app.post("/register", function (req, res) {
  var name = req.body.name;
  var password = req.body.password;
  var phone = req.body.phone;
  var email = req.body.email;
  var address = req.body.address;
  var pincode = req.body.pincode;

  userName = name;
  userPassword = password;
  userAddress = req.body.address;

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    console.log("Connected to Database");
    var dbo = db.db("fooddb");
    var r = {
      name,
      password,
      phone,
      email,
      address,
      pincode,
    };
    dbo.collection("User").insertOne(r, function (err, res) {
      if (err) throw err;
      console.log(res);
      db.close();
    });
  });

  res.sendFile(__dirname + "/index.html");
});

app.post("/login", function (req, res) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    console.log("Connected to Database");
    var dbo = db.db("fooddb");
    var find = { name: req.body.name };

    dbo
      .collection("User")
      .find(find)
      .toArray(function (err, result) {
        if (err) throw err;
        if (result.length == 0) {
          console.log("You are not an existing user");
          res.send("Not a user");
        } else {
          if (result[0].password != req.body.password) {
            console.log("Wrong Password");
          } else {
            userName = result[0].name;
            userPassword = result[0].password;
            userAddress = result[0].address;
            console.log(result);
            res.sendFile(__dirname + "/index.html");
          }
        }
        db.close();
      });
  });
});

app.get("/snacks.html", function (req, res) {
  res.sendFile(__dirname + "/snacks.html");
  console.log(userName + " " + userPassword);
});

app.get("/main_course.html", function (req, res) {
  res.sendFile(__dirname + "/main_course.html");
});

app.get("/dessert.html", function (req, res) {
  res.sendFile(__dirname + "/dessert.html");
});

app.get("/login.html", function (req, res) {
  res.sendFile(__dirname + "/login.html");
});

app.get("/cart.html", function (req, res) {
  console.log("We are here, Get me if u can!");
  res.sendFile(__dirname + "/cart.html");
});

app.get("/index.html", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.post("/cartdetails", function (req, res) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("fooddb");
    dbo
      .collection("Cart")
      .find({ userName: userName })
      .toArray(function (err, result) {
        res.status(200).send(result);
        db.close();
      });
  });
});

var port = process.env.PORT || 9000;
var server = app.listen(port, function () {
    console.log("Server started on Port: ", port);
});
