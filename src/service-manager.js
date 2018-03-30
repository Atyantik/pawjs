import { Tapable } from "tapable";
export default class ServiceManager extends Tapable {

  constructor({env, app}) {
    super();
    this.hooks = {};
    this.env = env;

    this.initServices({app});
  }

  // Init private services with public get and set
  initServices({app}) {

    let services = {
      app
    };
    this.getService = (name = "", defaultValue = false) => {
      if (!name) {
        return defaultValue;
      }
      return _.get(services, name, defaultValue);
    };

    this.setService = (name = "", value = null) => {
      if(!name || !value) {
        throw new Error (`Invalid service name: ${name} or value: ${value}`);
      }
      if (name === "app") {
        throw new Error("app is a reserved service name.");
      }
      _.set(services, name, value);
      return this;
    };
  }
}