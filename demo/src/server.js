export default class Server {
  apply(serviceManager) {

    serviceManager.hooks.initRoutes.tap("AddReduxSupport", (Routes) => {
      Routes.addRoute({

      });
    });

    serviceManager.hooks.onCompile.tap("Console Log Success:", () => {
      console.log("compilation completed");
    });
  }
}