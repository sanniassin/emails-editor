if (process.env.NODE_ENV === "production") {
  module.exports = require("./lib/emails-editor.production.min.js");
} else {
  module.exports = require("./lib/emails-editor.development.js");
}
