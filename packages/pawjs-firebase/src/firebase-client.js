import firebase from "firebase";
let firebaseInstance = typeof window["__paw_firebase"] !== "undefined"? window["__paw_firebase"]: null;

if (!firebaseInstance) {
  window["__paw_firebase"] = firebaseInstance = firebase;
}

export default firebaseInstance;