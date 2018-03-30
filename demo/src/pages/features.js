/**
 * Created by Yash Thakur
 * Date: 27/10/17
 * Time: 4:41 PM
 */

import FeaturesLayout from "../app/components/features/layout";
import DefaultLayout from "../app/components/layout";
import FeaturesIndex from "../app/components/features/index";
import PWA from "../app/components/features/feature-list/pwa/pwa";
import AccessOffline from "../app/components/features/feature-list/access-offline/access-offline";
import CodeSplitting from "../app/components/features/feature-list/code-splitting/code-splitting";
import HotReloading from "../app/components/features/feature-list/hot-reloading/hot-reloading";
import NextGenJS from "../app/components/features/feature-list/nextgen-js/nextgen-js";
import SSR from "../app/components/features/feature-list/ssr/ssr";
import SocialSharing from "../app/components/features/feature-list/social-sharing/social-sharing";
import UniversalRouting from "../app/components/features/feature-list/iso-uni-routing/iso-uni-routing";
import Caching from "../app/components/features/feature-list/caching/caching";
import HSTS from "../app/components/features/feature-list/hsts/hsts";
import ImageOptimization from "../app/components/features/feature-list/image-optimization/image-optimization";
import ContentFolding from "../app/components/features/feature-list/content-folding/content-folding";
import SEO from "../app/components/features/feature-list/seo/seo";
import Bundling from "../app/components/features/feature-list/bundling/bundling";

const routes = [
  {
    path: "/features",
    abstract: true,
    component: FeaturesLayout,
    layout: DefaultLayout,
    props: {
      title: "Features"
    },
    seo: {
      title: "Features | React PWA",
      description: "Get started with your own Progressive web application in the most simplest way.",
      keywords: "pwa,progressive web application,code splitting,ssr,server side rendering,social sharing,react,boilerplate,caching,hot reloading,next gen js,isomorphic/universal routing,seo,bundling,image optimization,hsts",
      type: "article"
    },
    routes: [
      {
        path: "/features",
        exact: true,
        component: FeaturesIndex,
        props: {
          title: "Features"
        },
        seo: {
          title: "Features",
          description: "Features list of React-PWA boilerplate",
          keywords: "pwa,progressive web application,features,responsive,service worker,application,features",
          type: "article"
        }
      },
      {
        path: "/features/pwa-progressive-web-application",
        exact: true,
        component: PWA,
        props: {
          title: "Progressive Web Application - PWA"
        },
        seo: {
          title: "Progressive Web Application - PWA | Features",
          description: "Progressive Web Application - PWA.",
          keywords: "pwa,progressive web application,features,responsive,service worker,application",
          type: "article"
        }
      },
      {
        path: "/features/access-offline",
        exact: true,
        component: AccessOffline,
        props: {
          title: "Offline Accessibility"
        },
        seo: {
          title: "Offline Accessibility | Features",
          description: "Access the website offline even when no internet connection is available once it has been loaded.",
          keywords: "offline,accessibility,internet",
          type: "article"
        }
      },
      {
        path: "/features/code-splitting",
        exact: true,
        component: CodeSplitting,
        props: {
          title: "Code Splitting"
        },
        seo: {
          title: "Code Splitting | Features",
          description: "Load code lazily as you need it.",
          keywords: "offline,accessibility,internet",
          type: "article"
        }
      },
      {
        path: "/features/hot-reloading",
        exact: true,
        component: HotReloading,
        props: {
          title: "Hot Reloading"
        },
        seo: {
          title: "Hot Reloading | Features",
          description: "Instantly preview the changes saved.",
          keywords: "accessibility,hot,reloading,hot-reload",
          type: "article"
        }
      },
      {
        path: "/features/next-gen-js-es6-es7",
        exact: true,
        component: NextGenJS,
        props: {
          title: "Next Generation JavaScript"
        },
        seo: {
          title: "Next Generation JavaScript | Features",
          description: "Next Generation Javascript using ES6 and ES7",
          keywords: "ES6,ES7,next generation, javascript",
          type: "article"
        }
      },
      {
        path: "/features/isomorphic-universal-routing",
        exact: true,
        component: UniversalRouting,
        props: {
          title: "Isomorphic/Universal Routing"
        },
        seo: {
          title: "Isomorphic/Universal Routing | Features",
          description: "Universal Routing helps to add routes to the application so that it isn’t literally a “single-page app” anymore.",
          keywords: "isomorphic,universal,routing,application",
          type: "article"
        }
      },
      {
        path: "/features/seo-search-engine-optimization",
        exact: true,
        component: SEO,
        props: {
          title: "Search Engine Optimization - SEO"
        },
        seo: {
          title: "Search Engine Optimization - SEO | Features",
          description: "Search engine optimization (SEO) is the process of optimizing your online content, so that a search engine likes to show it as a top result for searches of a certain keyword.",
          keywords: "seo,search,engine,optimization,web seo,ranking",
          type: "article"
        }
      },
      {
        path: "/features/seo-search-engine-optimization/social-sharing",
        exact: true,
        component: SocialSharing,
        props: {
          title: "Social Sharing"
        },
        seo: {
          title: "Social Sharing | Features",
          description: "Also known as Social Previews, allow you to choose the image, title, and description that will display on social media platforms when you or someone else shares your content.",
          keywords: "social,sharing,facebook,fb,twitter,linkedin,google,g+",
          type: "article"
        }
      },
      {
        path: "/features/seo-search-engine-optimization/ssr-server-side-rendering",
        exact: true,
        component: SSR,
        props: {
          title: "Server Side Rendering - SSR"
        },
        seo: {
          title: "Server Side Rendering - SSR | Features",
          description: "When the server receives the request, it renders the required component(s) into an HTML string, and then sends it as a response to the client.",
          keywords: "server,side,rendering,ssr,requests,client,browser",
          type: "article"
        }
      },
      {
        path: "/features/seo-search-engine-optimization/content-folding",
        exact: true,
        component: ContentFolding,
        props: {
          title: "Content Folding"
        },
        seo: {
          title: "Content Folding | Features",
          description: "Content Folding: Above the fold is anything that a user sees once they land in the webpage. Below the fold can be loaded asynchronously, thus saving many bytes of data while initial loading from the server.",
          keywords: "content,folding",
          type: "article"
        }
      },
      {
        path: "/features/caching",
        exact: true,
        component: Caching,
        props: {
          title: "Caching"
        },
        seo: {
          title: "Caching | Features",
          description: "Browser caching can help by storing some of the files locally in the user's browser. Their first visit to your site will take the same time to load, however when that user revisits your website, refreshes the page, or even moves to a different page of your site, they already have some of the files they need locally.",
          keywords: "caching,server,browser,webpage,website,data,architecture,feature",
          type: "article"
        }
      },
      {
        path: "/features/bundling",
        exact: true,
        component: Bundling,
        props: {
          title: "Bundling"
        },
        seo: {
          title: "Bundling | Features",
          description: "Webpack is a module bundler that takes assets such as CSS, images or JavaScript files with lots of dependencies and turns them into something that you can provide to a client web page.",
          keywords: "bundling,strategy,webpack,babel,reactjs,react",
          type: "article"
        }
      },
      {
        path: "/features/image-optimization",
        exact: true,
        component: ImageOptimization,
        props: {
          title: "Image Optimization"
        },
        seo: {
          title: "Image Optimization | Features",
          description: "Optimizing images means saving bytes and improving performance for your website: the fewer bytes per image, the faster the browser can download and render the content on your users’ screens.",
          keywords: "image,optimization,webp,srcSet,seo,web,websites,automatic,benefits",
          type: "article"
        }
      },
      {
        path: "/features/hsts",
        exact: true,
        component: HSTS,
        props: {
          title: "HTTP Strict Transport Security - HSTS"
        },
        seo: {
          title: "HTTP Strict Transport Security -HSTS | Features",
          description: "HTTP Strict Transport Security-HSTS is a web server directive that informs user agents and web browsers how to handle its connection through a response header sent at the very beginning and back to the browser.",
          keywords: "hsts,http,transport,security,policy,header,chrome,apache,nginx,aws,azure",
          type: "article"
        }
      }
    ]
  }
];
export default routes;