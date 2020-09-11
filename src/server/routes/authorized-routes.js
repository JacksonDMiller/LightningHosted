const Users = require("../models/user-model");
var multer = require("multer");
const sharp = require("sharp");
const crypto = require("crypto");
const imageSize = require("image-size");
const { createInvoice, authenticatedLndGrpc } = require("ln-service");
const keys = require("../config/keys");
const { lnd } = authenticatedLndGrpc(keys.lnd);
const fsPromises = require("fs").promises;
const getVideoDimensions = require("get-video-dimensions");
const logger = require("winston");
const genThumbnail = require("simple-thumbnail");

//seting up multer
// multer for image uploads
var uploadImage = multer({
  dest: "src/server/uploads/compressed",
  // file size limit for images
  limits: { fileSize: 1024 * 1024 * 1024 * 5 },

  // filter uploaded files based on MimeType
  fileFilter: function fileFilter(req, file, cb) {
    const acceptedMimeTypes = [
      "image/jpeg",
      "video/mp4",
      "image/gif",
      "image/png",
    ];
    let error = null;
    if (!req.user) {
      error = "Please log in first";
    }
    if (!acceptedMimeTypes.includes(file.mimetype)) {
      error = "Unsported file type";
    }
    if (error) {
      // reject the file and return error
      cb(error, false);
    } else {
      // if no error accept the file
      cb(null, true);
    }
  },
});

// multer for avatar uploads
var uploadAvatar = multer({
  // max file size for avatar images
  limits: { fileSize: 1024 * 1024 * 1024 * 2 },
  dest: "src/server/uploads/avatars",

  // filter uploaded files using molter based on MimeType
  fileFilter: function fileFilter(req, file, cb) {
    const acceptedMimeTypes = ["image/jpeg", "image/png"];
    let error = null;
    if (!req.user) {
      error = "Please log in first";
    }
    if (!acceptedMimeTypes.includes(file.mimetype)) {
      error = "Unsported file type";
    }
    if (error) {
      // return error and reject the file
      cb(error, false);
    } else {
      // accept the file
      cb(null, true);
    }
  },
});

module.exports = function (app) {
  // change a user avatar
  app.post(
    "/api/uploadavatar",
    uploadAvatar.single("avatar", (err) => {
      logger.log({
        level: "error",
        message: "avatar upload error" + err,
      });
    }),
    async function (req, res) {
      try {
        var newAvatarFileName =
          "A" + crypto.randomBytes(8).toString("hex") + ".jpeg";
        await sharp(req.file.path)
          .jpeg({ quality: 100, force: true })
          .rotate()
          .toFile("src/server/uploads/avatars/" + newAvatarFileName);
        // delete the uploaded file after creating a compressed copy
        fsPromises.unlink(req.file.path);
        // delete the old avatar image if there is one
        if (
          req.user.avatarFileName &&
          req.user.avatarFileName != "Default.jpg"
        ) {
          fsPromises.unlink(
            "src/server/uploads/avatars/" + req.user.avatarFileName
          );
        }
        req.user.avatarFileName = newAvatarFileName;
        req.user.avatarUrl = "/api/avatar/" + newAvatarFileName;
        req.user.save();
        res.status(200).send({ avatarUrl: req.user.avatarUrl });
      } catch (err) {
        logger.log({
          level: "error",
          message: "avatar creation error" + err,
        });
        res.status(500).send({ error: `Sorry something went wrong.` });
      }
    }
  );

  // Upload a new image, process it, add it to the datbase.
  // create an invoice for the deposit if required
  // this function is a rats nest and should be refactored
  app.post("/api/upload", uploadImage.single("filepond"), async function (
    req,
    res
  ) {
    let imagesUploadeToday = 0;
    let paymentRequired = false;
    let imageInvoice = "";
    const imagesPerDayCap = 5;
    // determine how many images have been uploaded in the last day
    for await (let image of req.user.images) {
      if (new Date() - image.date <= 86400000 && !image.paymentRequired) {
        imagesUploadeToday = imagesUploadeToday + 1;
      }
    }
    // if its over the cap then require a deposit
    if (imagesUploadeToday > imagesPerDayCap) {
      paymentRequired = true;
    }

    if (Object.keys(req.file).length === 0) {
      return res.status(400).send("No files were uploaded.");
    } else {
      const imageFileName = crypto.randomBytes(8).toString("hex");
      let imageExtension = "";
      try {
        // if (paymentRequired === true) {
        imageInvoice = createInvoice({
          lnd,
          description: "LightningHosted deposit",
          tokens: "100",
        });
        // }
        const processedImage = new Promise(async (resolve, reject) => {
          try {
            // if the image is a gif don't do any procesing
            // converting gifs to mp4s on upload is on the to do list.
            if (req.file.mimetype === "image/gif") {
              await fsPromises.rename(
                req.file.path,
                "src/server/uploads/compressed/" + imageFileName + ".gif"
              );
              resolve("gif");
            }
            if (
              req.file.mimetype === "image/jpeg" ||
              req.file.mimetype === "image/png"
            ) {
              await sharp(req.file.path)
                .jpeg({ quality: 75, force: true })
                .rotate()
                .toFile(
                  "src/server/uploads/compressed/" +
                    imageFileName +
                    "." +
                    "jpeg"
                )
                .catch((err) => {
                  return err;
                });
              fsPromises.unlink(req.file.path);
              resolve("jpeg");
            }
            if (req.file.mimetype === "video/mp4") {
              await fsPromises
                .rename(
                  req.file.path,
                  "src/server/uploads/compressed/" + imageFileName + ".mp4"
                )
                .then(resolve("mp4"));
            }
          } catch (error) {
            reject("error proessing the image" + error);
          }
        });
        await processedImage.then((ext) => (imageExtension = ext));
        const getDimensions = new Promise(async (resolve, reject) => {
          try {
            if (imageExtension === "mp4") {
              let result = await getVideoDimensions(
                "src/server/uploads/compressed/" + imageFileName + ".mp4"
              );
              resolve(result);
            } else {
              let result = await imageSize(
                "src/server/uploads/compressed/" +
                  imageFileName +
                  "." +
                  imageExtension
              );
              resolve(result);
            }
          } catch (error) {
            reject("problems getting dimensions" + error);
          }
        });
        var dimensions = await getDimensions.then((d) => (dimensions = d));

        const generateThumbnail = new Promise(async (resolve, reject) => {
          try {
            if (imageExtension === "mp4") {
              async function generateMp4Thumbnail() {
                try {
                  await genThumbnail(
                    "src/server/uploads/compressed/" + imageFileName + ".mp4",
                    "src/server/uploads/thumbnails/" + imageFileName + ".jpeg",
                    dimensions.width + "x" + dimensions.height
                  );
                  resolve(true);
                } catch (err) {
                  resolve(false);
                }
              }
              await generateMp4Thumbnail();
            } else {
              sharp(
                "src/server/uploads/compressed/" +
                  imageFileName +
                  "." +
                  imageExtension
              )
                .jpeg({ quality: 20, force: true })
                .rotate()
                .toFile(
                  "src/server/uploads/thumbnails/" +
                    imageFileName +
                    "." +
                    "jpeg"
                );
            }
          } catch (err) {
            reject("Thumbnail generation error" + err);
          }
          resolve(true);
        });

        await generateThumbnail;

        await imageInvoice
          .then((invoice) => {
            imageInvoice = invoice.request;
          })
          .catch((err) => {
            throw err[2].err.details + "its here";
          });

        let imageOrientation = "horizontal";
        if (dimensions.height > dimensions.width) {
          imageOrientation = "vertical";
        }

        let imageData = {
          recentViews: [],
          posterId: req.user._id,
          orientation: imageOrientation,
          imageId: imageFileName,
          reviewStatus: false,
          payStatus: false,
          deleted: false,
          views: 0,
          reports: 0,
          filename: imageFileName + "." + imageExtension,
          thumbnail: imageFileName + ".jpeg",
          width: dimensions.width,
          height: dimensions.height,
          date: new Date(),
          caption: req.body.caption,
          title: req.body.title.substring(0, 40),
          paymentRequest: imageInvoice,
          paymentRequired: paymentRequired,
          upvotes: 0,
          sats: 0,
          numberOfComments: 0,
          filetype: imageExtension,
          ogType: "ogType",
          twitterCard: "twitterCard",
          suppressed: false,
        };
        await req.user.images.push(imageData);
        req.user.save();

        res.status(200).send(imageData);
      } catch (err) {
        logger.log({
          level: "error",
          message: err,
        });
        res.status(400).send({ error: err });
      }
    }
  });

  // send profile info
  app.get("/api/profileinfo/", async (req, res) => {
    if (req.user) {
      // remove previously deleted records
      let fillteredImages = req.user.images.filter((image) => {
        if (image.deleted === false) {
          return image;
        }
      });
      req.user.images = fillteredImages;
      res.send(req.user);
    } else {
      res.status(401).send({ error: `Please log in` });
    }
  });

  // upvote an image and record that that the user has upvoted the image
  // or remove the upvote if it has previously been upvoted
  app.get("/api/upvote/:imageId", async (req, res) => {
    if (req.user) {
      if (!req.user.upvoted.includes(req.params.imageId)) {
        try {
          const doc = await Users.findOne({
            "images.imageId": req.params.imageId,
          });
          const index = await doc.images.findIndex(
            (image) => image.imageId === req.params.imageId
          );
          doc.images[index].upvotes = doc.images[index].upvotes + 1;
          doc.upvotes = doc.upvotes + 1;
          doc.save();
          req.user.upvoted.push(req.params.imageId);
          req.user.save();
          res.status(200).send({ message: `upvoted`, user: req.user });
        } catch (error) {
          logger.log({
            level: "error",
            message: "upvote error: " + error,
          });
          res.status(404).send({ error: "Oops something went wrong" });
        }
      } else {
        try {
          const doc = await Users.findOne({
            "images.imageId": req.params.imageId,
          });
          const index = await doc.images.findIndex(
            (image) => image.imageId === req.params.imageId
          );
          doc.images[index].upvotes = doc.images[index].upvotes - 1;
          if (doc.images[index].upvotes < 0) {
            doc.images[index].upvotes = 0;
          }
          doc.save();
          let filtered = req.user.upvoted.filter(
            (id) => id !== req.params.imageId
          );
          req.user.upvoted = filtered;
          req.user.save();
          res.status(200).send({ message: `upvoted`, user: req.user });
        } catch (error) {
          logger.log({
            level: "error",
            message: "upvote error: " + error,
          });
          res.status(404).send({ error: "Oops something went wrong" });
        }
      }
    } else {
      res.status(401).send({ error: `Please log in` });
    }
  });

  // collect a report from a user. record that they have reported the image.
  app.get("/api/report/:imageId", async (req, res) => {
    if (req.user && !req.user.reported.includes(req.params.imageId)) {
      try {
        const doc = await Users.findOne({
          "images.imageId": req.params.imageId,
        });
        const index = await doc.images.findIndex(
          (image) => image.imageId === req.params.imageId
        );
        doc.images[index].reports = doc.images[index].reports + 1;
        doc.save();
        req.user.reported.push(req.params.imageId);
        req.user.save();
        res.status(200).send();
      } catch (error) {
        logger.log({
          level: "error",
          message: "Image reporting error: " + error,
        });
        res.status(404).send("Oops something went wrong");
      }
    } else {
      res.status(401).send({ error: `Please log in` });
    }
  });

  // need to think more about how to sanatiaze this input
  // need to think of an appropriate way to throttle comments for bad actors
  // add a new comment
  app.post("/api/newcomment", async (req, res) => {
    function sanitizeString(str) {
      str = str.replace(/[^a-z0-9áéíóúñü \.?!""₿()$#@&,_-]/gim, "");
      return str.trim();
    }
    var { imageId, comment } = req.body;
    if (req.user) {
      try {
        const sanatizedComment = sanitizeString(comment);
        var newComment = {
          commentId: "CI" + crypto.randomBytes(8).toString("hex"),
          date: new Date(),
          comment: sanatizedComment,
          upvotes: 0,
          comenterId: req.user._id,
          comenter: req.user.username,
          avatar: req.user.avatarUrl,
          deleted: false,
          suppressed: false,
        };
        const doc = await Users.findOne({ "images.imageId": imageId });
        const index = await doc.images.findIndex(
          (image) => image.imageId === imageId
        );
        doc.images[index].comments.push(newComment);
        doc.images[index].numberOfComments =
          doc.images[index].numberOfComments + 1;
        doc.save();
        res.status(200).send({ newComment: newComment });
      } catch (error) {
        logger.log({
          level: `error`,
          message: `Comment Error` + error,
        });
        res.status(404).send(`Oops something went wrong`);
      }
    } else {
      res.status(401).send({ error: `Please log in` });
    }
  });

  // delete an image if you are the owner of the image
  app.post("/api/deleteimage/", async (req, res) => {
    if (req.user) {
      try {
        const index = await req.user.images.findIndex(
          (image) => image.imageId === req.body.imageId
        );
        req.user.images[index].deleted = true;
        req.user.save();
        res.status(200).send({ message: "deleted" });
      } catch (error) {
        logger.log({
          level: "error",
          message: `Delete image Error` + error,
        });
        res.status(404).send(`Oops something went wrong`);
      }
    } else {
      res.status(401).send({ error: `Please log in` });
    }
  });

  //change your user name to a username that is not already taken
  app.post("/api/changeusername", async (req, res) => {
    if (req.user) {
      try {
        if (/^[a-zA-Z0-9_]{3,16}$/.test(req.body.username)) {
          const newUsernameLowerCase = req.body.username.toLowerCase();
          const doc = await Users.findOne({
            lowerCaseUserName: newUsernameLowerCase,
          });
          if (doc === null) {
            req.user.username = req.body.username;
            req.user.lowerCaseUserName = req.body.username.toLowerCase();
            req.user.save();
            res.status(200).send({ message: "updated" });
          } else {
            res.status(400).send({ error: `That username is already taken` });
          }
        } else {
          res.status(400).send({ error: `Invalid Username` });
        }
      } catch (error) {
        logger.log({
          level: `error`,
          message: `username change error: ` + error,
        });
      }
    } else {
      res.status(401).send({ error: `Please log in` });
    }
  });

  // delete a comment if you own it
  app.get("/api/deletecomment/:commentId", async (req, res) => {
    try {
      if (req.user) {
        let index = 0;
        const doc = await Users.findOne({
          "images.comments.commentId": req.params.commentId,
        });
        doc.images.forEach((image) => {
          index = image.comments.findIndex(
            (comment) => comment.commentId === req.params.commentId
          );
          if (index !== -1) {
            // only allow deleting if you made the comment
            if (image.comments[index].comenterId == req.user._id) {
              image.comments[index].deleted = true;
              doc.save();
            } else {
              res.status(404).send("Oops something went wrong");
            }
          }
        });

        res.send(doc);
      } else {
        res.status(401).send({ error: `Please log in` });
      }
    } catch (error) {
      res.status(404).send("Oops something went wrong");
    }
  });
};
