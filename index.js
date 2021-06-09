const express = require("express");
var mongo = require("mongodb").MongoClient;
const { MongoClient } = require("mongodb");
var ObjectId = require("mongodb").ObjectID;
var cors = require("cors");
var jwt = require("jsonwebtoken");
var app = express();
var port = 8000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
// app.use((req, res, next) => {
//     res.header({"Access-Control-Allow-Origin": "*"});
//     next();
//   })

//Find() method, to look at all the data
mongo.connect("mongodb://localhost:27017/mern", (err, server) => {
  if (err) {
    console.log("connection error " + err);
  } else {
    app.post("/get_users", (req, res) => {
      // if(req.body.hasOwnProperty("limit") &&
      // req.body.hasOwnProperty("skip")){
      var users = [];
      var cursor = server
        .db()
        .collection("users")
        .find({})
        .limit(parseInt(req.body.limit))
        .skip(parseInt(req.body.skip));

      cursor.forEach(
        function (doc, err2) {
          if (!err2) {
            users.push(doc);
          }
        },
        function () {
          if (users.length === 0) {
            res.json({ status: false, message: "No data in collection" });
          } else {
            res.json({ status: true, result: users });
          }
        }
      );
      // }   else{
      //     res.json({status : false, message: "some params are missing"});
      // }
    });
  }
});

// 60bf22d266ebd1c7544db9de
//required params - name, email, contact, gender
//response - status, message, output, error
mongo.connect("mongodb://localhost:27017/mern", function (err, server) {
  if (err) {
    res.json({ status: false, message: "Connection error " + err });
  } else {
    //API TO ADD A NEW USER TO THE USERS COLLECTION
    app.post("/add_single_user", (req, res) => {
      if (
        req.body.hasOwnProperty("name") &&
        req.body.hasOwnProperty("email") &&
        req.body.hasOwnProperty("contact") &&
        req.body.hasOwnProperty("gender")
      ) {
        let encrypted_password = jwt.sign(
          req.body.password,
          "60bf0844631ee1ba280d0ff5"
        );
        var userData = {
          name: req.body.name,
          email: req.body.email,
          password: encrypted_password,
          contact: req.body.contact,
          gender: req.body.gender,
        };
        {userData}
        server
          .db()
          .collection("users")
          .insertOne(userData, (err2, result) => {
            if (err2) {
              res.json({
                status: false,
                message: "User couldn't be added" + err2,
              });
            } else {
              res.json({ status: true, message: "User added successfully" });
              console.log(result);
            }
          });
      } else {
        res.json({ status: false, message: "some params missing" });
      }
    });

    app.post("/verify_user", (req, res) => {
      if (req.body.hasOwnProperty("email")) {
        server
          .db()
          .collection("users")
          .findOne({ email: req.body.email }, (error, doc) => {
            if (!error) {
              if (doc) {
                jwt.verify(
                  doc.password,
                  "60bf0844631ee1ba280d0ff5",
                  function (err, decoded) {
                    console.log(decoded);
                  }
                );
              }
            } else {
              res.json({ status: false, message: "Login failed" });
            }
          });
      } else {
        res.json({ status: false, message: "Some params are missing" });
      }
    });

    //API TO ADD MULTIPLE USERS TO THE USERS COLLECTION
    app.post("/add_multiple_user", (req, res) => {
      if (req.body.hasOwnProperty("users")) {
        var users = JSON.parse(req.body.users);
        // As it takes object type as input, so we need to convert the users type from string to json
        if (users.length === 0) {
          res.json({ status: false, message: "User array is empty" });
        } else {
          server
            .db()
            .collection("users")
            .insertMany(users, (err2, result) => {
              if (err2) {
                res.json({
                  status: false,
                  message: "User couldn't be added" + err2,
                });
              } else {
                res.json({ status: true, message: "User added successfully" });
              }
            });
        }
      } else {
        res.json({ status: false, message: "Some params are missing" });
      }
    });

    //API TO DELETE A USER FROM THE USERS COLLECTION
    app.post("/delete_user", (req, res) => {
      if (req.body.hasOwnProperty("email")) {
        var user = req.body;
        console.log(user);
        server
          .db()
          .collection("users")
          .deleteOne(user, (err2, result) => {
            if (err2) {
              res.json({
                status: false,
                message: "Couldn't delete the user" + err2,
              });
            } else {
              res.json({ status: true, message: "User deleted successfully." });
              console.log(result);
            }
          });
      } else {
        res.json({ status: false, message: "Some params are missing." });
      }
    });

    //API TO DELETE MULTIPR USERS FROM THE "USERS" COLLECTION
    app.post("/delete_multiple_user", (req, res) => {
      if (req.body.hasOwnProperty("user")) {
        var user = JSON.parse(req.body.user);
        console.log(user);
        if (user.length === 0) {
          res.json({ status: false, message: "User array is empty" });
        } else {
          server
            .db()
            .collection("users")
            .deleteMany({ email: { $in: user } }, (err2, result) => {
              if (err2) {
                res.json({
                  status: false,
                  message: "Couldn't delete the users " + err2,
                });
              } else {
                res.json({
                  status: true,
                  message: "User deleted Successfully.",
                });
                // console.log(result);
              }
            });
        }
      } else {
        res.json({ status: false, message: "Some params are missing." });
      }
    });

    app.post("/remove_multiple_users", (req, res) => {
      console.log(req.body.user_ids);
      var arr = JSON.parse(req.body.user_ids);
      console.log(arr);
      arr.forEach((id, i) => {
        arr[i] = new ObjectId(id);
        console.log(arr[i]);
      });
      server
        .db()
        .collection("users")
        .deleteMany({ _id: { $in: arr } }, (err, result) => {
          if (err) {
            res.json({ status: false, message: "error occured" });
          } else {
            res.json({
              status: true,
              message: "documents deleted",
              result: result,
            });
          }
        });
    });

    //API TO UPDATE A USER IN THE "USER" COLLECTION
    app.post("/update_user", (req, res) => {
      if (req.body.hasOwnProperty("email")) {
        var emailId = req.body.email;
        var user = {
          name: req.body.name,
          gender: req.body.gender,
        };
        // console.log(id);
        console.log(user);
        server
          .db()
          .collection("users")
          .updateOne({ email: emailId }, { $set: user }, (err2) => {
            if (err2) {
              res.json({
                status: false,
                message: "Couldn't update the user" + err2,
              });
            } else {
              res.json({
                status: true,
                message: "Document updated successfully.",
              });
              // console.log(result);
            }
          });
      } else {
        res.json({ status: false, message: "Some params are missing." });
      }
    });

    //API TO UPDATE MULTIPLE USERS IN THE "USER" COLLECTION
    app.post("/update_multiple_users", (req, res) => {
      if (req.body.hasOwnProperty("email")) {
        var emails = JSON.parse(req.body.email1);
        var updates = {
          name: req.body.name,
          gender: req.body.gender,
        };
        console.log(emails);
        console.log(updates);
        if (updates.length === 0) {
          res.json({ status: false, message: "User array is empty" });
        } else {
          server
            .db()
            .collection("users")
            .updateMany(
              { email: { $in: emails } },
              { $set: updates },
              (err2, result) => {
                if (err2) {
                  res.json({
                    status: false,
                    message: "Couldn't update the user" + err2,
                  });
                } else {
                  res.json({
                    status: true,
                    message: "Document updated successfully.",
                  });
                  // console.log(result);
                }
              }
            );
        }
      } else {
        res.json({ status: false, message: "Some params are missing." });
      }
    });

    app.post("/user_details", (req, res) => {
      var user_details = [];
      var cursor = server
        .db()
        .collection("users")
        .aggregate([
          { $match: { gender: "F" } },
          {
            $lookup: {
              from: "gender_count",
              localField: "gender",
              foreignField: "gender",
              as: "final",
            },
          },
          { $unwind: "$final" },
        ]);

      cursor.forEach(
        (doc, err) => {
          if (!err) {
            user_details.push(doc);
          }
        },
        () => {
          res.json({ status: true, result: user_details });
        }
      );
    });
  }
});

// Updating users
mongo.connect("mongodb://localhost:27017/mern", function (err, server) {
  if (err) {
    console.log("connection error " + err);
  } else {
    app.post("/update_users_dynamically", (req, res) => {
      server
        .db()
        .collection("users")
        .updateOne(
          { name: "Sarat123" },
          {
            $set: { name: "Rajiv", email: "rajiv@gmail.com", contact: 9876643 },
          }
        );
    });
  }
});

app.get("/", (req, res) => {
  res.send("welcome to express project");
});

app.get("/check", (req, res) => {
  console.log(req.query);
  res.send("HI " + req.query.name);
});

app.post("/login", (req, res) => {
  console.log(req.body.email);
  // res.send("email: "+req.body.email);
  if (req.body.hasOwnProperty("email") && req.body.hasOwnProperty("password")) {
    if (
      req.body.email === "baibhav.ray@gmail.com" &&
      req.body.password === "1234"
    ) {
      res.json({ status: true, message: "Login successfull" });
    } else {
      res.send({ status: false, message: "Invalid user" });
    }
  } else {
    res.send({ status: false, message: "some params are missing" });
  }
});
app.listen(port, () => {
  console.log("app is running on port " + port);
});
