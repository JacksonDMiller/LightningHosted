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

// setting up express
const app = express();
app.use(function (req, res, next) {
  if (req.secure) {
    next();
  } else {
    // request was via http, so redirect to https
    res.redirect("https://" + req.headers.host + req.url);
  }
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
