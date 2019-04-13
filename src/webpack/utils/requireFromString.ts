import path from 'path';

/* tslint:disable: variable-name */
const Module = require('module');
/* tslint:enable */

export default (code: string, fname: any, options?: any) => {
  let opts = options;
  let filename = fname;
  if (typeof filename === 'object') {
    opts = filename;
    filename = undefined;
  }

  opts = opts || {};
  filename = filename || '';

  opts.appendPaths = opts.appendPaths || [];
  opts.prependPaths = opts.prependPaths || [];

  if (typeof code !== 'string') {
    throw new Error(`code must be a string, not ${typeof code}`);
  }
  // @ts-ignore
  const paths = Module._nodeModulePaths(path.dirname(filename)); // eslint-disable-line

  const { parent } = Module;
  const m = new Module(filename, parent);
  m.filename = filename;
  m.paths = [].concat(opts.prependPaths).concat(paths).concat(opts.appendPaths);
  // eslint-disable-next-line
  m._compile(code, filename);

  const { exports } = m;
  if (parent && parent.children) {
    parent.children.splice(parent.children.indexOf(m), 1);
  }
  return exports;
};
