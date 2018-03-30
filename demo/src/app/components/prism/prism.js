import React, { Component } from "react";
import PropTypes from "prop-types";

export default class Header extends Component {
  static propTypes = {
    code: PropTypes.string,
    language: PropTypes.string,
  };
  static defaultProps = {
    code: "",
    language: "javascript"
  };
  prism = null;
  codeElement = null;
  constructor(props) {
    super(props);
    this.state = {
      code: props.code,
    };
  }
  componentWillReceiveProps(nextProps) {
    this.updateCode(nextProps);
  }
  componentDidUpdate() {
    this.initPrism();
  }
  componentDidMount() {
    this.initPrism();
  }
  updateCode(props = this.props) {
    this.setState({
      code: props.code
    });
  }
  initPrism() {
    if (typeof window === "undefined") return;
    if (!this.prism) {
      this.prism = require("prismjs");
    }
    this.prism.highlightElement(this.codeElement);
  }
  render() {
    return (
      <pre
        className={`${this.props.className} language-${this.props.language}`}
      ><code ref={codeElement => {this.codeElement = codeElement;}} className={`language-${this.props.language}`}>{this.state.code}</code></pre>
    );
  }
}