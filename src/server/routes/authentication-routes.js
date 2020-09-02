const Users = require("../models/user-model");
var passport = require("passport");
const logger = require("winston");
const bcrypt = require("bcrypt");

module.exports = function (app) {
  // change a user password if they provide the old password
  app.post("/api/changepassword", (req, res) => {
    bcrypt.compare(
      req.body.password,
      req.user.password,
      async (bcryptErr, bcryptRes) => {
        if (bcryptErr) {
          res.send({ error: "oops something went wrong" });
          return;
        }
        if (!bcryptRes) {
          res.send({ error: "Wrong Password" });
          return;
        }
        const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
        req.user.password = hashedPassword;
        req.user.save();
        res.send({ message: "Password Updated" });
      }
    );
  });

  // use passport to authenticate with google
  app.get(
    "/api/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })
  );

  // login with username and password
  app.post("/api/loginsubmit", passport.authenticate("local"), (req, res) => {
    if (req.user) {
      res.send({ user: req.user });
    } else {
      res.send({ error: "Incorrect Username or Password" });
    }
  });

  app.get(
    "/api/google/redirect",
    passport.authenticate("google"),
    (req, res) => {
      res.redirect("/profile");
    }
  );

  // auth logout
  app.get("/api/logout", (req, res) => {
    // handle with passport
    req.logout();
    res.redirect("/");
  });

  // create new user with username and password.
  app.post("/api/register", async (req, res) => {
    // allow an empty email
    if (req.body.email !== "") {
      // reject improperly formated email addresses
      if (
        !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
          req.body.email
        )
      ) {
        res.status(400).send({ error: `Improperly formated email address` });
        return;
      }
    }
    // test for a legal user name
    if (/^[a-zA-Z0-9_-]{3,16}$/.test(req.body.username)) {
      let newUsernameLowerCase = req.body.username.toLowerCase();
      let newUserEmailAddress = req.body.email.toLowerCase();
      // check if the email is already in use
      const doc = await Users.findOne({
        lowerCaseUserName: newUsernameLowerCase,
      });
      if (doc === null) {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        new Users({
          password: hashedPassword,
          email: newUserEmailAddress,
          thirdPartyId: undefined,
          estimatedSats: 0,
          earnedSats: 0,
          sats: 0,
          paidSats: 0,
          views: 0,
          username: req.body.username,
          lowerCaseUserName: newUsernameLowerCase,
          upvotes: 0,
          avatarUrl: "/api/avatar/Default.jpg",
          avatarFileName: "Default.jpg",
          moderator: false,
          upvoted: [],
          reported: [],
        })
          .save()
          .then((newuser) => res.send({ user: newuser }));
      } else {
        res.status(400).send({ error: `That username is already taken` });
      }
    } else {
      res.send({ error: "Invalid Username" });
    }
  });
};
