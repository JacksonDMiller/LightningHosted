// this file loads babel and then loads the rest of the server files
require("@babel/polyfill");
require("@babel/register")({
  presets: ["@babel/preset-env", "@babel/preset-react"],
});
require("@babel/plugin-transform-runtime");

require("./server");
