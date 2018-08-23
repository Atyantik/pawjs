import firebase from "./firebase-server";
export default class PawFirebaseServer {
  constructor(options, serviceAccountDetails) {
    firebase.setup(options, serviceAccountDetails);
  }
}