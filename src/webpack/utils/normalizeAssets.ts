import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import isArray from 'lodash/isArray';
import each from 'lodash/each';
import uniq from 'lodash/uniq';
import map from 'lodash/map';
import compact from 'lodash/compact';
import { Stats } from 'webpack';

type dependencyMap = {
  path: string;
  modules: string[];
};
interface INormalizeAssets {
  client?: string | string [];
  'vendor~client'?: string | string [];
  cssDependencyMap?: dependencyMap[];
}
export default (wStats: Stats): INormalizeAssets => {
  let assets = {};
  const cssDependencyMap: dependencyMap[] = [];
  let webpackStats = wStats.toJson();

  if (
    (typeof webpackStats.assets === 'undefined' || !webpackStats.assets.length)
    && webpackStats.children
    && webpackStats.children.length === 1
  ) {
    webpackStats = webpackStats.children;
  }

  if (!isArray(webpackStats)) {
    webpackStats = [webpackStats];
  }

  each(webpackStats, (stat) => {
    const { assetsByChunkName: a, publicPath } = stat;

    each(a, (chunkValue, chunkName) => {
      // If its array then it just contains chunk value as array
      if (isArray(chunkValue)) {
        each(chunkValue, (path, index) => {
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
            a[chunkName][subChunkType] = `${publicPath}${subChunkValues}`;
          }
        });
      } else if (isString(chunkValue)) {
        a[chunkName] = `${publicPath}${chunkValue}`;
      }
    });

    each(stat.chunks, (chunk) => {
      let hasCSS = false;
      let cssFileName = '';
      each(chunk.files, (f) => {
        if (hasCSS) return;

        hasCSS = f.indexOf('.css') !== -1;
        if (hasCSS) cssFileName = f;
      });

      if (!hasCSS) return;

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
      cssDependencyMap.push({
        path: `${publicPath}${cssFileName}`,
        modules: moduleReasons,
      });
    });
    assets = { ...a, cssDependencyMap };
  });
  return assets;
};
