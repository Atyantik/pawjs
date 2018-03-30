import DocsLayout from "../app/components/docs/layout";
import DocPage from "../app/components/docs/page";
//import WorkingWithCss from "../app/components/docs/working-with-css";

import PendingDocs from "../app/components/docs/pending";
import DefaultLayout from "../app/components/layout";
import GettingStartedImage from "../app/components/docs/getting-started/Get Started - Docs.jpg";
import PagesAndRouting from "../app/components/docs/pages-and-routing/pages-routing";
import CreateNewPage from "../app/components/docs/pages-and-routing/create-new-page/create-new-page";
import PageWithSubroutes from "../app/components/docs/pages-and-routing/page-with-subroutes/page-wth-subroutes";
import PageWithLayout from "../app/components/docs/pages-and-routing/page-with-layout/page-wth-layout";
import OverrideCore from "../app/components/docs/override-core/override-core";
import ConfiguringRedux from "../app/components/docs/configuring-redux";

const routes = [
  {
    abstract: true,
    component: DocsLayout,
    layout: DefaultLayout,
    routes: [
      {
        path: "/docs",
        exact: true,
        component: DocPage,
        preLoadData: async ({api}) => {
          const content = await api.fetch("/docs?slug=getting-started");
          if (content.length) {
            return content[0];
          }
          const error = new Error("Page not found");
          error.statusCode = error.code = 404;
          throw error;
        },
        seo: {
          title: "Getting Started - Hello World | React PWA",
          description: "Get started with your own Progressive web application in the most simplest way.",
          keywords: "pwa,progressive web application,hello world,react,getting started,tutorials",
          image: GettingStartedImage,
          type: "article"
        }
      },
      {
        path: "/docs/configuring-pwa",
        exact: true,
        component: DocPage,
        preLoadData: async ({api}) => {
          const content = await api.fetch("/docs?slug=configuring-pwa");
          if (content.length) {
            return content[0];
          }
          const error = new Error("Page not found");
          error.statusCode = error.code = 404;
          throw error;
        },
        props: {
          title: "Configuring PWA"
        },
        seo: {
          title: "Configuring PWA | React PWA",
          description: "Modify the PWA for your own application. Set the background color and theme color. Setting for add to home screen.",
          keywords: "theme,background,homescreen",
        }
      },
      {
        path: "/docs/customizing-loader",
        exact: true,
        component: DocPage,
        preLoadData: async ({api}) => {
          const content = await api.fetch("/docs?slug=customizing-loader");
          if (content.length) {
            return content[0];
          }
          const error = new Error("Page not found");
          error.statusCode = error.code = 404;
          throw error;
        },
        props: {
          title: "Customizing Loader"
        },
        seo: {
          title: "Customizing Loader | React PWA",
          description: "Page loaders can be tricky and every web application has a different requirement for loading pages. Some wants to load whole page while others just a partial section",
          keywords: "loaders,page loading,spinner,history change",
        }
      },
      {
        path: "/docs/working-with-css",
        exact: true,
        component: DocPage,
        preLoadData: async ({api}) => {
          const content = await api.fetch("/docs?slug=working-with-css");
          if (content.length) {
            return content[0];
          }
          const error = new Error("Page not found");
          error.statusCode = error.code = 404;
          throw error;
        },
        props: {
          title: "Working with CSS"
        },
        seo: {
          title: "Working with CSS | React PWA",
          description: "Use CSS for module that is loaded, other css can be lazy loaded. Create lightweight application with bundled CSS. Use your favourite SASS compiler with postcss",
          keywords: "postcss,sass,css,css3,node-sass,css-next",
        }
      },
      {
        path: "/docs/error-pages",
        exact: true,
        component: PendingDocs,
        props: {
          title: "Error Pages"
        },
        seo: {
          title: "Error Pages | React PWA",
          description: "Modify you error pages for 404 and 500. Show interactive error messages and not-found page with ReactPWA.",
          keywords: "error,404,500,Internal Server Error,server,not found"
        }
      },
      {
        path: "/docs/overriding-core-components",
        exact: true,
        component: OverrideCore,
        props: {
          title: "Overriding Core Components"
        },
        seo: {
          title: "Overriding Core Components | React PWA",
          description: "Override core components for more flexibility and customization. End goal of ReactPWA is to provide flexibility, not stiffness",
          keywords: "loader,root,override,404,500",
        }
      },
      {
        path: "/docs/pages-routing",
        exact: true,
        component: PagesAndRouting,
        props: {
          title: "Pages & Routing"
        },
        seo: {
          title: "Pages & Routing | React PWA",
          description: "Create separate bundles for different pages. Write universal routing. Easy to use and adapt react-router-configuration",
          keywords: "react-router,react-router-web,page,bundle,code-splitting"
        }
      },
      {
        path: "/docs/pages-routing/create-new-page",
        exact: true,
        component: CreateNewPage,
        props: {
          title: "Create a Simple Page and its Route"
        },
        seo: {
          title: "Create a Simple Page and its Route | React PWA",
          description: "Create separate bundles for different pages. Write universal routing. Easy to use and adapt react-router-configuration",
          keywords: "react-router,react-router-web,page,bundle,code-splitting"
        }
      },
      {
        path: "/docs/pages-routing/page-with-subroutes",
        exact: true,
        component: PageWithSubroutes,
        props: {
          title: "Create a Page with Sub-Routes"
        },
        seo: {
          title: "Create a Page with Sub-Routes | React PWA",
          description: "Create separate bundles for different pages. Write universal routing. Easy to use and adapt react-router-configuration",
          keywords: "react-router,react-router-web,page,bundle,code-splitting"
        }
      },
      {
        path: "/docs/pages-routing/page-with-layout",
        exact: true,
        component: PageWithLayout,
        props: {
          title: "Create a Page with Layout"
        },
        seo: {
          title: "Create a Page with Layout | React PWA",
          description: "Create separate bundles for different pages. Write universal routing. Easy to use and adapt react-router-configuration",
          keywords: "react-router,react-router-web,page,bundle,code-splitting"
        }
      },
      {
        path: "/docs/external-script-libraries",
        exact: true,
        component: PendingDocs,
        props: {
          title: "Using external script libraries"
        },
        seo: {
          title: "Using external script libraries | React PWA",
          description: "Don't get stuck with limited resources. Use external JS SDKs to solve your problem in PWA.",
          keywords: "pwa,3rd Party JS,SDK,GTM,GA,DISQUS",
        }
      },
      {
        path: "/docs/page-transitions",
        exact: true,
        component: PendingDocs,
        props: {
          title: "Page transitions"
        },
        seo: {
          title: "Page Transitions | React PWA",
          description: "Don't just reload page. Do it with a style. ReactPWA can handle page transitions really simple with lightweight CSS transitions",
          keywords: "transition,css,css transitions,history change",
        }
      },
      {
        path: "/docs/ssr-server-side-rendering",
        exact: true,
        component: PendingDocs,
        props: {
          title: "SSR - Server side rendering"
        },
        seo: {
          title: "Server side rendering | React PWA",
          description: "Never let the end user wait for the JavaScript to load, instead send the data with server side rendering and load the JavaScript there after.",
          keywords: "ssr,server side rendering,render,seo,server side render",
        }
      },
      {
        path: "/docs/configuring-redux",
        exact: true,
        component: ConfiguringRedux,
        props: {
          title: "Configuring Redux"
        },
        seo: {
          title: "Configuring Redux | React PWA",
          description: "Use redux for your application. Adding your custom reducers and actions can not be more easy.",
          keywords: "redux,react-redux,connect",
        }
      },
    ]
  }
];

export default routes;
