export type LoadableState = {
  completed: boolean;
  loading: boolean;
  resource: any;
  error: Error | null;
  promise?: Promise<any>;
};

export const load = (
  loader: (arg0: any) => Promise<any>,
  props?: any,
): LoadableState => {
  const p = loader(props);
  let promise = p;
  if (typeof p.then === 'undefined') {
    promise = new Promise(res => res(p));
  }
  const state: LoadableState = {
    promise,
    completed: false,
    loading: true,
    resource: null,
    error: null,
  };

  state.promise = promise.then((resource) => {
    state.resource = resource;
    state.completed = true;
    return resource;
  }).catch((err: Error) => {
    state.error = err;
    throw err;
  }).finally(() => {
    state.loading = false;
  });
  return state;
};

export default (
  obj: any,
  loadedData: any,
  props: any,
): LoadableState => {
  const state: LoadableState = {
    completed: false,
    loading: false,
    resource: {},
    error: null,
  };

  const promises: Promise<any> [] = [];
  try {
    Object.keys(obj).forEach((key) => {
      let result = null;
      if (key === 'LoadData' && loadedData) {
        result = {
          loading: false,
          resource: loadedData,
          promise: (async () => loadedData)(),
        };
      } else {
        if (key === 'LoadData') {
          result = load(obj[key], props);
        } else {
          result = load(obj[key]);
        }

        if (!result.loading) {
          state.resource[key] = result.resource;
          state.error = result.error;
        } else {
          state.loading = true;
        }
      }

      if (result.promise) {
        promises.push(result.promise);
        result.promise.then((res) => {
          state.resource[key] = res;
        }).catch((err) => {
          state.error = err;
        });
      }
    });
  } catch (err) {
    state.error = err;
  }

  state.promise = Promise.all(promises)
    .then((res) => {
      state.completed = true;
      return res;
    })
    .catch(() => {
      // Do nothing on error caught, as it is already set to
      // state.error in above code!
    })
    .finally(() => {
      state.loading = false;
    });
  return state;
};
