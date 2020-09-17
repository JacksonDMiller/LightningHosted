const Users = require("./models/user-model");

export let topPostsList = [];

export async function updateTopTenList() {
  topPostsList = [];
  const record = await Users.find({}).lean();
  record.forEach((element) => {
    //sort images
    for (let image in element.images) {
      if (!element.images[image].deleted && !element.images[image].suppressed) {
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
}
