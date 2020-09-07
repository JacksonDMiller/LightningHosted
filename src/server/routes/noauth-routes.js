import Users from "../models/user-model";

module.exports = function (app) {
  // a list of the top posts
  var topPostsList = [];
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

  const updateTopTenList = async () => {
    topPostsList = [];
    const record = await Users.find({}).lean();
    record.forEach((element) => {
      //sort images
      for (let image in element.images) {
        if (
          !element.images[image].deleted &&
          !element.images[image].suppressed
        ) {
          // dont include images that require a deposti if the deposit has not been paid
          if (
            !element.images[image].paymentRequired ||
            element.images[image].payStatus
          ) {
            let hoursSincePosting = Math.round(
              (new Date() - element.images[image].date) / 1000 / 60 / 60
            );
            element.images[image].score =
              element.images[image].views +
              element.images[image].upvotes -
              hoursSincePosting;
            topPostsList.push(element.images[image]);
          }
        }
      }
      topPostsList.sort((a, b) => b.score - a.score);
    });
  };
  // initail server start update
  updateTopTenList();

  // get an image from the server  i = image
  app.get("/api/i/:filename", (req, res) => {
    res.sendFile("/src/server/uploads/compressed/" + req.params.filename, {
      root: "./",
    });
  });

  // get a thumbnail from the server  t = thumbnail
  app.get("/api/t/:filename", (req, res) => {
    res.sendFile("/src/server/uploads/thumbnails/" + req.params.filename, {
      root: "./",
    });
  });

  // get an avatar from the server
  app.get("/api/avatar/:filename", (req, res) => {
    res.sendFile("/src/server/uploads/avatars/" + req.params.filename, {
      root: "./",
    });
  });

  // get an image's record from the DB
  app.get("/api/imageinfo/:imageId", (req, res) => {
    // find the image data in the database
    Users.findOne({ "images.imageId": req.params.imageId })
      .then(async (user, err) => {
        if (err) {
          res.send("oops");
        }
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
        console.log(err);
        res.send("We couldn't find that image");
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
};
