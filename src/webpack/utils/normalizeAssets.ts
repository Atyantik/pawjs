import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import isArray from 'lodash/isArray';
import each from 'lodash/each';
import uniq from 'lodash/uniq';
import map from 'lodash/map';
import compact from 'lodash/compact';
import * as webpack from 'webpack';

type dependencyMap = {
  path: string;
  modules: string[];
};
export interface INormalizeAssets {
  client?: string | string [];
  'vendor~client'?: string | string [];
  cssDependencyMap?: dependencyMap[];
  jsDependencyMap?: dependencyMap[];
}

const populate = (chunks:any [], type: string, publicPath: string) => {
  const arr: dependencyMap [] = [];
  each(chunks, (chunk) => {
    let hasType = false;
    let typeFileName = '';
    each(chunk.files, (f) => {
      if (hasType) return;

      hasType = f.indexOf(type) !== -1;
      if (hasType) typeFileName = f;
    });

    if (!hasType) return;

    let moduleReasons: string[] = [];
    each(chunk.modules, (m) => {
      moduleReasons = moduleReasons.concat(map(m.reasons, 'userRequest'));
    });

    if (
      Array.isArray(chunk.names)
      && (
        chunk.names.indexOf('client') !== -1
        || chunk.names.indexOf('vendors~client') !== -1
      )
    ) {
      moduleReasons.unshift('pawProjectClient');
    }
    moduleReasons = uniq(compact(moduleReasons));
    if (chunk.names.indexOf('vendors~client') === -1) {
      arr.push({
        path: `${publicPath}${typeFileName}`,
        modules: moduleReasons,
      });
    } else {
      arr.unshift({
        path: `${publicPath}${typeFileName}`,
        modules: moduleReasons,
    });
  }
  });
  return arr;
};

export default (wStats: webpack.Stats): INormalizeAssets => {
  let assets = {};
  let cssDependencyMap: dependencyMap[] = [];
  let jsDependencyMap: dependencyMap[] = [];
  let webpackStats: any = wStats.toJson();

  if (
    (typeof webpackStats.assets === 'undefined' || !webpackStats.assets.length)
    && webpackStats.children
    && webpackStats.children.length === 1
  ) {
    // @ts-ignore
    webpackStats = webpackStats.children;
  }

  if (!isArray(webpackStats)) {
    // @ts-ignore
    webpackStats = [webpackStats];
  }

  webpackStats.forEach((stat: webpack.Stats.ToJsonOutput) => {
    // @ts-ignore
    const { assetsByChunkName: a, publicPath } = stat;

    each(a, (chunkValue, chunkName) => {
      // If its array then it just contains chunk value as array
      if (isArray(chunkValue)) {
        each(chunkValue, (path, index) => {
          // @ts-ignore
          a[chunkName][index] = `${publicPath}${path}`;
        });
      } else if (isObject(chunkValue)) {
        each(chunkValue, (subChunkValues, subChunkType) => {
          if (isArray(subChunkValues) || isObject(subChunkValues)) {
            each(subChunkValues, (subChunkValue, subChunkIndex) => {
              // @ts-ignore
              a[chunkName][subChunkType][subChunkIndex] = `${publicPath}${subChunkValue}`;
            });
          } else if (isString(subChunkValues)) {
            // @ts-ignore
            a[chunkName][subChunkType] = `${publicPath}${subChunkValues}`;
          }
        });
      } else if (isString(chunkValue)) {
        // @ts-ignore
        a[chunkName] = `${publicPath}${chunkValue}`;
      }
    });

    if (stat.chunks) {
      cssDependencyMap = populate(stat.chunks, '.css', publicPath || '');
      jsDependencyMap = populate(stat.chunks, '.js', publicPath || '');
    }
    assets = { ...a, cssDependencyMap, jsDependencyMap };
  });
  return assets;
};
