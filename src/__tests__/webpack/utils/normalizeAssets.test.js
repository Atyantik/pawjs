const normalizeAssets = require("../../../webpack/utils/normalizeAssets");

class MockWebpackAssets {
  constructor(type = "MIXED") {
    this.type = type;
  }
  toJson() {
    if (this.type === "MIXED") {
      return {
        publicPath: "/",
        assetsByChunkName: [
          "test.js",
          [
            "test1.js"
          ],
          {
            "main": "main.3as122.js"
          },
          {
            "client": [
              "client.bundle.js",
              "client.css"
            ]
          }
        ]
      };
    }

    return {
      children: [
        {
          publicPath: "/",
          assetsByChunkName: [
            "test.js"
          ]
        }
      ]
    };
  }
}

test("Normalize should take care of Mixed data", () => {
  expect(normalizeAssets(new MockWebpackAssets())[0]).toBe("/test.js");
  expect(normalizeAssets(new MockWebpackAssets("CHILDREN"))[0]).toBe("/test.js");
});