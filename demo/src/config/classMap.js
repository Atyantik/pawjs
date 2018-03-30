import Err404 from "../app/components/error/404";
import Err500 from "../app/components/error/500";
import Offline from "../app/components/error/offline";
import Loader from "../app/components/loader";
import Fold from "pawjs/src/components/fold";
import Root from "../app/components/root";

/**
 * Specify Mapping of components respective to
 * src folder
 * @type Object
 */
export default {
  "error/404": Err404,
  "error/500": Err500,
  "error/offline": Offline,
  "loader": Loader,
  "fold": Fold,
  "root": Root
};