const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const authRoute = require("./routes").auth;
const courseRoute = require("./routes").course;
const passport = require("passport");
require("./comfig/passport")(passport);
const cors = require("cors");

mongoose
  .connect("mongodb://localhost:27017/mernDB")
  .then(() => {
    console.log("connecting to mongodb...");
  })
  .catch((e) => {
    console.log(e);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/user", authRoute);
//只有登入系統的人，才能夠去新增課程或註冊課程

app.use(
  "/api/courses",
  passport.authenticate("jwt", { session: false }),
  courseRoute
);

app.listen(8080, () => {
  console.log("後端sever聆聽在port 8080...");
});
