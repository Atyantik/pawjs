import React, {Component} from "react";
import PropTypes from "prop-types";

export default class Picture extends Component {
  static propTypes = {
    alt: PropTypes.string,
    image: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.shape({
        "sources": PropTypes.object,
        "type": PropTypes.string,
        "srcSet": PropTypes.string,
        "placeholder": PropTypes.shape({
          "color": PropTypes.array,
          "url": PropTypes.string,
          "ratio": PropTypes.number
        })
      })),
      PropTypes.string,
    ]),
    pictureClassName: PropTypes.string,
    imgClassName: PropTypes.string,
  };
  static defaultProps = {
    alt: "",
    image: [],
    pictureClassName: "",
    imgClassName: "",
  };
  
  constructor(props) {
    super(props);
    this.state = {
      image: this.rearrange(props.image),
      showImage: false,
    };
    this.elementRef = React.createRef();
    this.observer = null;
  }
  
  stopObserving() {
    if (this.observer) {
      this.observer.unobserve && this.observer.unobserve(this.elementRef.current);
      this.observer.disconnect && this.observer.disconnect();
      this.observer = null;
    }
  }
  showImage() {
    if ("IntersectionObserver" in window) {
      const options = {
        rootMargin: "0px",
        threshold: 0.1
      };
  
      this.observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if(entry.intersectionRatio > 0) {
            this.stopObserving();
            this.setState({
              showImage: true
            });
          }
        });
      }, options);
      this.observer.observe(this.elementRef.current);
      
    } else {
      this.setState({
        showImage: true
      });
    }
  }
  componentDidMount() {
    if ("requestIdleCallback" in window) {
      // requestIdleCallback supported
      window.requestIdleCallback(() => this.showImage());
    }
    else {
      // no support - do something else
      setTimeout(this.showImage(), 1);
    }
  }
  
  componentWillUnmount() {
    this.stopObserving();
  }
  
  componentWillReceiveProps(nextProps) {
    this.setState({
      image: this.rearrange(nextProps.image)
    });
  }
  
  rearrange(image) {
    if (!Array.isArray(image)) return image;
    const webpSet = image.find(img => img.type.toLowerCase() === "image/webp");
    // If no webp set is found, then simply return the image as it is
    if (!webpSet) return image;
    
    const sortedImages = image.filter(img => img.type && img.type.toLowerCase() !== "image/webp");
    sortedImages.unshift(webpSet);
    return sortedImages;
  }
  
  getFallbackSrc(image) {
    if (typeof image === "string") return image;
    if (Array.isArray(image) && image.length >= 2) {
      let selectSet = image.find(img => img.type.toLowerCase() !== "image/webp");
      if (!selectSet) {
        selectSet = image[0];
      }
      
      let placeholder = selectSet.placeholder && selectSet.placeholder.url ? selectSet.placeholder.url: "";
      if (placeholder) return placeholder;
      
      let sources = (
        selectSet.sources &&
        typeof selectSet.sources === "object" &&
        (Object.keys(selectSet.sources).length)
      ) ? selectSet.sources: {};
      
      let sourcesKeys = Object.keys(sources);
      if (!sourcesKeys.length) return "";
      return sources[sourcesKeys[sourcesKeys.length - 1]];
    }
  }
  getSourceSrc(image) {
    const sources = image && image.sources && Object.keys(image.sources).length ? image.sources : {};
    let sourcesKeys = Object.keys(sources);
    if (!sourcesKeys.length) return "";
    return sources[sourcesKeys[sourcesKeys.length - 1]];
  }
  getSrcSet(image) {
    let srcSet = image && image.srcSet ? image.srcSet: "";
    if (srcSet) return srcSet;
    
    return `${this.getSourceSrc(image)} 1w`;
  }
  render() {
    const { alt, imgClassName, pictureClassName } = this.props;
    const { image } = this.state;
    return (
      <picture className={pictureClassName} ref={this.elementRef}>
        {this.state.showImage && (
          image.map(img => {
            const srcSet = this.getSrcSet(img);
            return <source type={img.type} srcSet={srcSet} key={srcSet}/>;
          })
        )}
        <img className={imgClassName} src={this.getFallbackSrc(image)} alt={alt} />
      </picture>
    );
  }
}
