const path = require('path');

module.exports = {
  "extends": "./node_modules/@pawjs/pawjs/.eslintrc",
  "rules": {
    "import/no-extraneous-dependencies": 0,
    "react/jsx-boolean-value": 0
  },
  "overrides": [
    {
      "files": ["*.ts", "*.tsx"],
      "parser": "@typescript-eslint/parser",
      "rules": {
        "no-undef": "off",
        "no-unused-vars": "off",
        "react/prop-types": "off"
      }
    }
  ],

  "settings": {
    "import/resolver": {
      "webpack": {
        "config": path.resolve(__dirname, "webpack.resolver.js")
      }
    }
  }
};
