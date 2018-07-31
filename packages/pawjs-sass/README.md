PawJS - SASS
===  

## @pawjs/sass

Add SASS support to your current application

This plugin adds `node-sass` & `sass-loader` to current webpack configuration for sass

## Installation
```bash
npm i @pawjs/sass --save-dev
```

### webpack.js
Edit/Create <project-root>/src/webpack.js
```javascript
import SassPlugin from "@pawjs/sass/webpack";

// ... other imports if any


export default class ProjectWebpack {
  constructor({addPlugin}) {

    addPlugin(new SassPlugin);
    // ...
  }
}

```

### License
This project is licensed under the MIT license, Copyright (c) 2018 [Atyantik Technologies Private Limited](https://www.atyntik.com). For more information see [LICENSE.md]("https://github.com/Atyantik/pawjs/blob/master/LICENSE.md").  