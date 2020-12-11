import Users from "../models/user-model";
const fs = require("fs");
import "ignore-styles";
import React from "react";
import ReactDOMServer from "react-dom/server";
import AppServer from "../../client/Components/AppServer";
import path from "path";
import { topPostsList, updateTopTenList } from "../topPosts";

module.exports = function (app) {
  // a list of ip's and the images they have viewed recently to avoid multiple views on an image
  var recentViewsList = [];

  //refreshing the top posts list periodically
  setInterval(function () {
    updateTopTenList();
  }, 1000 * 60);

  // cleaning up the rcentviews list every hour I don't mind double counting views
  // I just dont want to count views multiple views in a short amount of time.
  setInterval(function () {
    recentViewsList = [];
  }, 1000 * 60 * 60);

  // initail server start update
  updateTopTenList();

  // get an image from the server  i = image
  app.get("/api/i/:filename", (req, res) => {
    res.sendFile(
      "/src/server/uploads/compressed/" + req.params.filename,
      {
        root: "./",
      },
      (err) => {
        if (err) {
          console.log(err);
          res.send(`Oops we can't find that file`);
        }
      }
    );
  });

  // get a thumbnail from the server  t = thumbnail
  app.get("/api/t/:filename", (req, res) => {
    res.sendFile(
      "/src/server/uploads/thumbnails/" + req.params.filename,
      {
        root: "./",
      },
      (err) => {
        if (err) {
          console.log(err);
          res.send(`Oops we can't find that file`);
        }
      }
    );
  });

  // get an avatar from the server
  app.get("/api/avatar/:filename", (req, res) => {
    res.sendFile(
      "/src/server/uploads/avatars/" + req.params.filename,
      {
        root: "./",
      },
      (err) => {
        if (err) {
          console.log(err);
          res.send(`Oops we can't find that file`);
        }
      }
    );
  });

  // get an image's record from the DB
  app.get("/api/imageinfo/:imageId", (req, res) => {
    // find the image data in the database
    Users.findOne({ "images.imageId": req.params.imageId })
      .then(async (user, err) => {
        let imageData = {};
        for (let image in user.images) {
          if (user.images[image].imageId === req.params.imageId) {
            imageData = user.images[image];
            break;
          }
        }
        // update the comments list with current usernames and avatars
        for (let comment in imageData.comments) {
          let user = await Users.findOne({
            _id: imageData.comments[comment].comenterId,
          });
          imageData.comments[comment].avatar = user.avatarUrl;
          imageData.comments[comment].comenter = user.username;
        }
        // filter out deleted and suppressed comments
        imageData.comments = imageData.comments.filter(
          (comment) => !comment.suppressed
        );
        imageData.comments = imageData.comments.filter(
          (comment) => !comment.deleted
        );
        res.send(imageData);
      })
      .catch((err) => {
        res.send({ error: "We couldn't find that image" });
      });
  });

  // get the next ten images from top images list
  app.get("/api/recomendedimages/:page", (req, res) => {
    let start = 0 + req.params.page * 40;
    let end = 40 + req.params.page * 40;
    res.send(topPostsList.slice(start, end));
  });

  // incrment page view and store ip address if ip address has not already been seen recently
  app.get("/api/incrementPageView/:imageId", async (req, res) => {
    const doc = await Users.findOne({ "images.imageId": req.params.imageId });
    const index = await doc.images.findIndex(
      (image) => image.imageId === req.params.imageId
    );
    if (
      !recentViewsList.includes(
        req.connection.remoteAddress + req.params.imageId
      )
    ) {
      doc.images[index].views = doc.images[index].views + 1;
      doc.views = doc.views + 1;
      recentViewsList.push(req.connection.remoteAddress + req.params.imageId);
      doc.save();
    }
    res.status(200).send();
  });

  app.get("/api/checkifauthorized/", (req, res) => {
    if (req.user) {
      res.send(req.user);
    } else {
      res.send(false);
    }
  });

  app.get("/a/", (req, res) => {
    res.send(
      `  <div>
        <iframe
          data-aa="1259137"
          src="//ad.a-ads.com/1259137?size=728x90"
          scrolling="no"
          style="width:728px; height:90px; border:0px; padding:0; overflow:hidden"
          allowtransparency="true"
        ></iframe>
        <iframe
          data-aa="1259139"
          src="//ad.a-ads.com/1259139?size=468x60"
          scrolling="no"
          style="width:468px; height:60px; border:0px; padding:0; overflow:hidden"
          allowtransparency="true"
        ></iframe>
        <iframe
          data-aa="1443703"
          src="//ad.a-ads.com/1443703?size=320x50"
          scrolling="no"
          style="width:320px; height:50px; border:0px; padding:0; overflow:hidden"
          allowtransparency="true"
        ></iframe>
      </div>`
    );
  });

  app.get("/s/:imageId", async (req, res, next) => {
    console.log("hello");
    let title = "LightningHosted";
    let twitterTitle = "";
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
            `<title>"${title}</title>
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
          href="https://lightninghosted.com/api/t/${imageData.thumbnail}"
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
          content="https://lightninghosted.com/api/t/${imageData.thumbnail}"
        />
        <meta
          property="og:image"
          content="https://lightninghosted.com/api/t/${imageData.thumbnail}"
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
        console.log("avadddddddddfaa");
        res.send("We couldn't find that image");
      });
  });
};
