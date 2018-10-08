export default {
  server: {
    port: 3005,
  },
  api: {
    baseUrl: 'https://api.reactpwa.com/wp-json/wp/v2/',
  },
  hsts: {
    enabled: true,
    // mageAge: Must be at least 18 weeks to be approved by Google, but we are setting it to 1 year
    maxAge: 31536000,
    // Must be enabled to be approved by Google
    includeSubDomains: true,
    preload: false,
  },
  pwa: {
    name: 'React PWA',
    short_name: 'ReactPWA',
    // Possible values ltr(left to right)/rtl(right to left)
    dir: 'ltr',

    // language: Default en-US
    lang: 'en-US',

    // Orientation of web-app possible:
    // any, natural, landscape, landscape-primary, landscape-secondary, portrait, portrait-primary, portrait-secondary
    orientation: 'any',

    start_url: '/',
    // Background color of the application
    background_color: '#17a2b8',

    // Theme color, used to modify the status bar color etc
    theme_color: '#17a2b8',

    display: 'standalone',
    description: 'A highly scalable, Progressive Web Application foundation with the best Developer Experience.',
  },
  seo: {

  },
};
