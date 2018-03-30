export default class Client {
  apply(serviceManager) {
    const app = serviceManager.getService("app");
    // Setting redux initial state
    // app.hooks.redux.tap("InitializeRedux", redux => {
    //   // Do something with redux I guess!
    // });

    // Setting
    app.hooks.pageChange.tap("TrackPageChange", (page, title, location) => {
      console.log(page, title, location);
    });
  }
}
if (module.hot) module.hot.accept();