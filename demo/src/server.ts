import ReduxServer from '@pawjs/redux/server';

export default class Server {
  constructor({ addPlugin }) {
    const reduxServer = new ReduxServer();
    reduxServer.setReducers({
      counter(state = null) {
        return state;
      },
    });

    addPlugin(reduxServer);
  }
  // eslint-disable-next-line
  apply(serverHandler) {
    serverHandler
      .hooks
      .reduxInitialState
      .tapPromise('AppInitialState', async (reduxState) => {
        reduxState.setInitialState({
          counter: 1,
        });
      });
  }
}
