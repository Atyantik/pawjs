import * as admin from "firebase-admin";
let firebase = typeof global["__paw_firebase"] !== "undefined"? global["__paw_firebase"]: {};

const setup = (options, serviceAccountDetails) => {
  global["__paw_firebase"] = firebase = admin.initializeApp({
    credential: admin.credential.cert(serviceAccountDetails),
    databaseURL: options.databaseURL
  });
};

let handler = {
  get: function(target, name) {
    if (name === "setup") {
      return setup;
    }
    if (typeof global["__paw_firebase"] === "undefined") {
      throw new Error("firebase used without proper setup!");
    }
    return target[name];
  }
};

export default new Proxy(firebase, handler);



