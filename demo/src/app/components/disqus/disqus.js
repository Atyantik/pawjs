import _ from "lodash";
import React, {Component} from "react";
import {generateStringHash, loadScript} from "pawjs/src/utils/utils";

const __production = process.env.NODE_ENV === "production";

export default class Disqus extends Component {
  async loadDisqus() {
    let DISQUS = _.get(window, "DISQUS", false);
    if (DISQUS) return Promise.resolve(DISQUS);
    await loadScript("https://reactpwa.disqus.com/embed.js");
    DISQUS = _.get(window, "DISQUS", false);
    return Promise.resolve(DISQUS);
  }
  reloadWidget() {
    if (!__production) return;
    this.loadDisqus().then(DISQUS => {
      DISQUS.reset({
        reload: true,
        config: function () {
          this.page.identifier = generateStringHash(window.location.href, "DISQUS");
          this.page.url = window.location.href;
        }
      });
    });
  }
  componentWillReceiveProps() {
    this.reloadWidget();
  }
  componentDidMount() {
    this.reloadWidget();
  }
  render() {
    if (!__production) {
      return null;
    }
    return <div id="disqus_thread" />;
  }
}