const ghpages = require("gh-pages");

ghpages.publish(
  "docs",
  {
    branch: "gh-pages",
    repo: "https://github.com/MikeTschudi/arcgis-pdf-creator.git"
  },
  function(err) {
    if (err) {
      console.log("uh oh", err);
    } else {
      console.log("Deployed docs site!");
    }
  }
);
