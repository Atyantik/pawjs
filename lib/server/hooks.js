import Wook from "wook";

export default function(req, res, next) {
  // add events and filters to request and response
  if (!res.locals.wook) {
    res.locals.wook = new Wook();
  }
  next();
}