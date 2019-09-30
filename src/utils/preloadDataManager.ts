export default class PreloadDataManager {
  params = {};

  setParams(paramName, paramValue = null) {
    if (paramName) {
      this.params[paramName] = paramValue;
    }
  }

  getParams(paramName = '', defaultParamValue = null) {
    if (!paramName) {
      return this.params;
    }
    if (typeof this.params[paramName] !== 'undefined') {
      return this.params[paramName];
    }
    return defaultParamValue;
  }

  constructor() {
    this.setParams = this.setParams.bind(this);
    this.getParams = this.getParams.bind(this);
  }
}
