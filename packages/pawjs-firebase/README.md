PawJS - Firebase
===  

## @pawjs/firebase

Add Firebase support to pawjs implemented application

## Installation
```bash
npm i @pawjs/firebase --save-dev
```

### Create firebase.json in root folder

*Replace the below values with your own firebase configurations*
```json
{
  "apiKey": "AIzxXXC2XSFDVW98XZeFiVqt-XXXX_CI",
  "authDomain": "demoreactpwa.firebaseapp.com",
  "databaseURL": "https://example.firebaseio.com",
  "projectId": "example",
  "storageBucket": "",
  "messagingSenderId": "123456789123"
}

```
### Add plugin to the your web client `client.js`
Edit/Create <project-root>/src/client.js
```javascript
import FirebasePlugin from "@pawjs/firebase/client";
import FirebaseConfig from "../firebase.json";

// ... other imports if any


export default class ProjectClient {
  constructor({addPlugin}) {
    
    const firebase = new FirebasePlugin(FirebaseConfig);  

    addPlugin(firebase);
    // ...
  }
}

```


### Add plugin to the your web server `server.js`
If you are using Server Side rendering then do not forget to add the server plugin as well.
For isomorphic behaviour we would need both server and client plugins to be configured properly.
 
Edit/Create <project-root>/src/server.js

```javascript
import FirebasePlugin from "@pawjs/firebase/server";
import FirebaseConfig from "../firebase.json";

// ... other imports if any


export default class ProjectServer {
  constructor({addPlugin}) {
    
    const firebase = new FirebasePlugin(FirebaseConfig);  

    addPlugin(firebase);
    // ...
  }
}

```

### License
This project is licensed under the MIT license, Copyright (c) 2018 [Atyantik Technologies Private Limited](https://www.atyntik.com). For more information see [LICENSE.md]("https://github.com/Atyantik/pawjs/blob/master/LICENSE.md").  