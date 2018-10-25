PawJS - Srcset
===  

## @pawjs/srcset

Do not just optimize image but use srcset for appropriate size of image to load.
Reduce the page size and get more performance with auto generated webp and png with size of image you need

This plugin adds pwa-srcset-loader to current configuration

## Installation
```bash
npm i @pawjs/srcset --save-dev
```

### webpack.js
Edit/Create <project-root>/src/webpack.js
```javascript
import Srcset from "@pawjs/srcset/webpack";

// ... other imports if any


export default class ProjectWebpack {
  constructor({addPlugin}) {
    addPlugin(new Srcset());
    // ...
  }
}

```

------------

## How to use srcset?
It is pretty simple to use the plugin. 
In any file you are working with, if you need an image what you currently do is as below:
```javascript
import BigBannerImage from "../../resources/image/banner.png";

// then inside your component you use that image as something like:
export default () => {
  return <img src={BigBannerImage} alt="banner"/>;
};
 
```


The above code does not provide image resizing and optimization. With this plugin all you need to do is
```javascript
import BigBannerImage from "../../resources/image/banner.png?sizes=200w+400w+800w+1000w&placeholder";
import Picture from "@pawjs/srcset/picture";

// then inside your component you use that image as something like:
export default () => {
  return (
   <Picture 
     image={BigBannerImage} 
     alt="banner"
     pictureClassName="picture-class"
     imgClassName="img-class"
   /> 
  );
};
 
```

*OUTPUT*
```html
<picture class="picture-class">
  <source 
    type="image/webp" 
    srcset="/images/f9ef707b92eae5c6e0ba3a6ba94fae5e.webp 200w,/images/7c2961f91fdcf7ab6f029e18df7874b6.webp 400w, /images/as3de61f91fdcf7ab6f029e18df9564b6.webp 800w,/images/ww211f91fdcf7ab6f029e18df9564b6.webp 1000w"
  >
  <source 
    type="image/png" 
    srcset="/images/1211707b92eae5c6e0ba3a6ba94fae5e.png 200w,/images/1kdix12291fdcf7ab6f029e18df7874b6.png 400w, /images/8eww81f91fdcf7ab6f029e18df9564b6.png 800w,/images/ww211f91fdcf7ab6f029e18df9564b6.png 1000w"
  >
  <img 
    class="img-class" 
    src="data:image/svg+xml;base64,EEXZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2aWV3Qm94PSIwIDAgMjAgMTMiPgogICAgICAgICAgPGZpbHRlciBpZD0ieCI+CiAgICAgICAgICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjEiIC8+CiAgICAgICAgICA8L2ZpbHRlcj4KICAgICAgICAgIDxpbWFnZSB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bGluazpocmVmPSJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUJRQUFBQU5DQUlBQUFBbU10a0pBQUFBQ1hCSVdYTUFBQllsQUFBV0pRRkpVaVR3QUFBQkkwbEVRVlFvejVXUzZZNkNVQXlGZmY4bjRnbjhBNUlJS0VUREptNFFJanV5R0RMZmNBa3hFOFBFazFEYTB0TjdTdS9xT2FKdDJ5ekw2cnArZm9NVmhHRVlORTJUSk9uMWV0V2ZzRVRtMlB2OW5pUkozL2Y0WGRmaGRHK2c3bU9qaVJ6SDhmRjRkQnpIOTMzYnRnK0hnK2Q1aEpabGtjL3puQmFVQ2M3YzRwZmNOTTNqOGJoY0xtRVlZdUdmeitjZ0NJUUY2T0lUdGlnSzBRWEtSQ2FtVGxWVldaYTMyKzErdjhmcXVvN2Q3WGFtYWVJZ1liUFpvSWp1dEtNTC9FbDJGRVd1Njk1dXQ2cXF5SlJsT1ZzeWxBbzdReWhmOGRDRHYwV0s2bXdFZnBxbWpJcHRSb2l5R2RQTTRrWE15ZXYxR20zb1Z4VEZNQXlrTXVmU251Y2ZpSEoveE9sMHVsNnY2Q1F2OXZRUGVkWXBwQkwrMmNvUytYMlM3NjZuMkROU3Y3M2JQeWtpM1RBL0RWZnJBQUFBQUVsRlRrU3VRbUNDIiBmaWx0ZXI9InVybCgjeCkiLz4KICAgICAgICA8L3N2Zz4=" 
    alt="banner"
  >
</picture>
```
I think it is pretty cool. takes care of converting image to webp and creates an srcset with sources that can handle webp along with fallback of png
 


### License
This project is licensed under the MIT license, Copyright (c) 2018 [Atyantik Technologies Private Limited](https://www.atyntik.com). For more information see [LICENSE.md]("https://github.com/Atyantik/pawjs/blob/master/LICENSE.md").  
