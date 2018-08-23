import firebase from "./firebase-client";
export default class PawFirebaseClient {
  constructor(options) {
    firebase.initializeApp(options);
  }
}