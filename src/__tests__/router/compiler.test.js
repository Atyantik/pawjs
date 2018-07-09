let RouterCompiler = require("../../router/compiler");
RouterCompiler = RouterCompiler.default ? RouterCompiler.default : RouterCompiler;
let RouteHandlerMock = require("./fixtures/RouteHandler");
RouteHandlerMock = RouteHandlerMock.default ? RouteHandlerMock.default : RouteHandlerMock;
//const RouterService = require("../../router/handler");
describe("Router Compiler", () => {
  const rCompiler = new RouterCompiler();
  const rService = new RouteHandlerMock();
  const route = {
    path: "/",
    component: "Hello, World"
  };
  const compiledRoute = rCompiler.compileRoute(route, rService);
  
  test("Every route should have SEO function getRouteSeo", () => {
    expect(compiledRoute.getRouteSeo)
      .toBeInstanceOf(Function);
  });
  
  test("getRouteSeo should always return an object", () => {
    expect(compiledRoute.getRouteSeo())
      .toBeInstanceOf(Object);
  });
  
  test("Should be able to compile multiple routes", () => {
    expect(rCompiler.compileRoutes([route], rService))
      .toBeInstanceOf(Array);
  });
  
  test("Should not contain timeout in compiled route", () => {
    expect(compiledRoute.timeout)
      .toBe(undefined);
  });
  
});