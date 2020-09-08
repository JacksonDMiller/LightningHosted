const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const passportSetup = require("./config/passport-setup");
const cookieSession = require("cookie-session");
const keys = require("./config/keys");
const logger = require("./log.js");
const fallback = require("express-history-api-fallback");
const mongoose = require("mongoose");
const https = require("https");
const http = require("http");
const fs = require("fs");
import "ignore-styles";
import React from "react";
import ReactDOMServer from "react-dom/server";
import AppServer from "../client/Components/AppServer";
import path from "path";
const Users = require("./models/user-model");

// setting up express
const app = express();
app.use(function (req, res, next) {
  if (req.secure) {
    next();
  } else {
    // request was via http, so redirect to https
    res.redirect("https://lightninghosted.com");
  }
});

app.get("/s/:imageId", async (req, res, next) => {
  let title = "LightningHosted";
  let imageData = "";
  Users.findOne({ "images.imageId": req.params.imageId })
    .then(async (user, err) => {
      if (err) {
        res.send("oops");
      }
      for (let image in user.images) {
        if (user.images[image].imageId === req.params.imageId) {
          imageData = user.images[image];
          break;
        }
      }

      if (imageData.title) {
        title = "LH - " + imageData.title;
      }

      fs.readFile(path.resolve("./dist/index.html"), "utf-8", (err, data) => {
        if (err) {
          console.log(err);
          return res.status(500).send("Some error happened");
        }
        data = data.replace(
          '<meta title="LightningHosted" />',
          `
     
        <title>"${title}</title>
      <meta
        name="description"
        content=
          "${imageData.views} views and ${imageData.upvotes} upvotes on LightningHosted.com"
      />
      <link
        rel="canonical"
        href="https://LightningHosted.com/s/${imageData.imageId}"
      />
      <meta name="twitter:title" content="${imageData.title}" />
      <link
        rel="image_src"
        href="https://lightninghosted.com/api/i/${imageData.filename}"
      />
      <meta property="og:title" content="${imageData.title}" />
      <meta
        property="og:url"
        content="https://LightningHosted.com/s/${imageData.imageId}"
      />
      <meta property="og:image:width" content="${imageData.width}" />
      <meta property="og:image:height" content="${imageData.height}" />
      <meta
        property="og:description"
        content="${imageData.views} views and ${imageData.upvotes} upvotes on LightningHosted.com"
      />
      <meta
        name="twitter:description"
        content="${imageData.views} views and ${imageData.upvotes} upvotes on LightningHosted.com"
      />
      <meta
        name="twitter:image"
        content="https://lightninghosted.com/api/i/${imageData.filename}"
      />
      <meta
        property="og:image"
        content="https://lightninghosted.com/api/i/${imageData.filename}"
      />`
        );
        return res.send(
          data.replace(
            '<div id="root"></div>',
            `<div id="root">${ReactDOMServer.renderToString(AppServer)}</div>`
          )
        );
      });
    })
    .catch((err) => {
      console.log(err);
      res.send("We couldn't find that image");
    });
});

app.use(express.static("dist"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [keys.session.cookieKey],
  })
);

app.use(passport.initialize());
app.use(passport.session());

//setting up mongodb
mongoose.connect("mongodb://localhost/LightningHosted", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("YipYip the datbase has connected!");
});

require("./routes/noauth-routes")(app);
require("./routes/authentication-routes")(app);
require("./routes/payment-routes")(app);
require("./routes/authorized-routes")(app);
require("./routes/moderator-routes")(app);

app.use(fallback("index.html", { root: "./dist" }));

app.listen(process.env.PORT || 8080, () =>
  console.log(`YipYip app is listening on port ${process.env.PORT || 8080}!`)
);

//  comment out for testing

const options = {
  key: fs.readFileSync(
    "/etc/letsencrypt/live/lightninghosted.com/privkey.pem",
    "utf8"
  ),
  cert: fs.readFileSync(
    "/etc/letsencrypt/live/lightninghosted.com/fullchain.pem",
    "utf8"
  ),
};

https.createServer(options, app).listen(443);
