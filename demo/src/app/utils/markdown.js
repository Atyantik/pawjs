import _ from "lodash";

export const processCode = (str = "") => {
  if (_.isString(str) || str) {
    return str.replace(/<pre><code class="language/g, "<pre class=\"prism\"><code class=\"language");
  }
  return str;
};