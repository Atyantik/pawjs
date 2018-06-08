import "./resources/css/style.scss";

export default class Client {

  apply(serviceManager) {
    // serviceManager.hooks.locationChange.tap("TrackPageChange", (page, title, location) => {
    //   console.log(page, title, location);
    // });
  }
}
if (module.hot) module.hot.accept();