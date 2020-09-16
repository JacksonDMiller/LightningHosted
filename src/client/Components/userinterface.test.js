const puppeteer = require("puppeteer");

test("Should create a new image and have the title be visible on the profile page", async () => {
  // set some options (set headless to false so we can see
  // this automated browsing experience)
  var title = Math.random() * 100;
  title = title.toString();
  // title = title.toDateString();
  let launchOptions = { headless: false };

  const browser = await puppeteer.launch(launchOptions);

  const page = await browser.newPage();
  await page.goto("localhost:3000/login");
  await page.click("#username-login");
  await page.type("#username-login", "Pooh");
  await page.click("#password-login");
  await page.type("#password-login", "Pooh");
  await Promise.all([
    await page.click(".btn"),
    page.waitForNavigation({ waitUntil: "networkidle0" }),
  ]);

  // get the selector input type=file (for upload file)
  await page.waitForSelector(".filepond--browser");

  // get the ElementHandle of the selector above
  const inputUploadHandle = await page.$(".filepond--browser");

  // prepare file to upload, I'm using test_to_upload.jpg file on same directory as this script
  // Photo by Ave Calvar Martinez from Pexels https://www.pexels.com/photo/lighthouse-3361704/
  let fileToUpload = "./src/server/uploads/avatars/Default.jpg";

  // Sets the value of the file input to fileToUpload
  inputUploadHandle.uploadFile(fileToUpload);
  await page.waitForSelector(".title-input");

  await page.type(".title-input", title);

  // doing click on button to trigger upload file
  await page.waitForSelector(".upload-btn");
  await page.click(".upload-btn");
  await page.waitForFunction(
    `document.querySelector("body").innerText.includes("${title}")`
  );
  let finaltest = true;
  expect(finaltest).toBe(true);
  await browser.close();
}, 30000);
