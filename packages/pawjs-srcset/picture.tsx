import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

type Image = {
  sources: any;
  type: string;
  srcSet: string;
  placeholder: {
    color: any [];
    url: string;
    ratio: number;
  },
};

type Picture = {
  alt?: string;
  image: Image [] | string;
  pictureClassName?: string;
  imgClassName?: string;
  top?: number;
};

declare global {
  interface Window {
    requestIdleCallback: any;
    IntersectionObserver: any;
  }
}

const rearrange = (image: Image[] | any [] | string): Image[] | any [] | string => {
  if (!Array.isArray(image)) return image;
  const webpSet = image.find(img => img.type.toLowerCase() === 'image/webp');
  // If no webp set is found, then simply return the image as it is
  if (!webpSet) return image;

  const sortedImages = image.filter(img => img.type && img.type.toLowerCase() !== 'image/webp');
  sortedImages.unshift(webpSet);
  return sortedImages;
};

const getFallbackSrc = (image: Image[] | string) => {
  if (typeof image === 'string') return image;
  if (Array.isArray(image) && image.length >= 2) {
    let selectSet = image.find(img => img.type.toLowerCase() !== 'image/webp');
    if (!selectSet) {
      [selectSet] = image;
    }
    const placeholder = (selectSet.placeholder && selectSet.placeholder.url)
      ? selectSet.placeholder.url
      : '';
    if (placeholder) return placeholder;

    const sources = (
      selectSet.sources
      && typeof selectSet.sources === 'object'
      && (Object.keys(selectSet.sources).length)
    ) ? selectSet.sources : {};

    const sourcesKeys = Object.keys(sources);
    if (!sourcesKeys.length) return '';
    return sources[sourcesKeys[sourcesKeys.length - 1]];
  }
  return '';
};

const getSourceSrc = (image: Image) => {
  const sources = (
    image
    && image.sources
    && Object.keys(image.sources).length
  ) ? image.sources : {};
  const sourcesKeys = Object.keys(sources);
  if (!sourcesKeys.length) return '';
  return sources[sourcesKeys[sourcesKeys.length - 1]];
};

const getSrcSet = (image: Image) => {
  const srcSet = image && image.srcSet ? image.srcSet : '';
  if (srcSet) return srcSet;
  return `${getSourceSrc(image)} 1w`;
};

export default (
  {
    alt,
    imgClassName,
    pictureClassName,
    image,
    top,
  }: Picture = {
    alt: '',
    image: [],
    pictureClassName: '',
    imgClassName: '',
    top: 0,
  },
) => {
  const [componentImages] = useState(rearrange(image));
  const [show, setShow] = useState(false);
  const elementRef: any = useRef(null);
  const observer: any = useRef(null);

  const stopObserving = () => {
    if (observer && observer.current && elementRef && elementRef.current) {
      if (observer.current.unobserve) {
        observer.current.unobserve(elementRef.current);
      }
      if (observer.current.disconnect) {
        observer.current.disconnect();
      }
      observer.current = null;
    }
  };

  const showImage = () => {
    if ('IntersectionObserver' in window) {
      const options = {
        rootMargin: `${top || 0}px`,
        threshold: 0.1,
      };

      observer.current = new window.IntersectionObserver(
        (entries: any) => {
          entries.forEach((entry: any) => {
            if (entry.intersectionRatio > 0) {
              stopObserving();
              setShow(true);
            }
          });
        },
        options,
      );
      observer.current.observe(elementRef.current);
    } else {
      setShow(true);
    }
  };

  // Manage the observer
  useEffect(
    () => {
      if ('requestIdleCallback' in window) {
        // requestIdleCallback supported
        window.requestIdleCallback(showImage);
      } else {
        // no support - do something else
        setTimeout(showImage, 1);
      }
      return () => stopObserving();
    },
    [
      elementRef,
    ],
  );

  const renderImage = () => {
    if (!show) {
      return null;
    }
    if (typeof componentImages === 'string') {
      return (
        <img
          className={imgClassName}
          src={componentImages}
          alt={alt}
        />
      );
    }
    let imgs: Image [] = [];
    if (Array.isArray(componentImages)) {
      imgs = componentImages;
    }
    return imgs.map((img: Image) => {
      const srcSet = getSrcSet(img);
      return <source type={img.type} srcSet={srcSet} key={srcSet} />;
    });
  };

  const renderFallback = () => {
    if (typeof image === 'string') {
      return null;
    }
    return <img className={imgClassName} src={getFallbackSrc(image)} alt={alt} />;
  };
  return (
    <picture className={pictureClassName} ref={elementRef}>
      {renderImage()}
      {renderFallback()}
    </picture>
  );
};
