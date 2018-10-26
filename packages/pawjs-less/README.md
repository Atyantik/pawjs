PawJS - LESS
===  

## @pawjs/less

Add LESS support to your current application

This plugin adds `less` & `less-loader` to current webpack configuration for less

## Installation
```bash
npm i @pawjs/less --save
```

### webpack.js
Edit/Create <project-root>/src/webpack.js
```javascript
import LessPlugin from "@pawjs/less/webpack";

// ... other imports if any


export default class ProjectWebpack {
  constructor({addPlugin}) {

    const options = {};
    // const options = {
    //   modifyVars: {},
    //   javascriptEnabled: false,
    // };
    addPlugin(new LessPlugin(options));
    // ...
  }
}

```

### License
This project is licensed under the MIT license, Copyright (c) 2018 [Atyantik Technologies Private Limited](https://www.atyntik.com). For more information see [LICENSE.md]("https://github.com/Atyantik/pawjs/blob/master/LICENSE.md").  
