class ServerError extends Error {
  statusCode: number = 500;

  name: string = 'ServerError';

  constructor(...args: any) {
    super(...args);
    if (Error.captureStackTrace && typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, ServerError);
    }
  }

  setStatusCode(code: number) {
    this.statusCode = code;
  }

  getStatusCode() {
    return this.statusCode;
  }

  set code(code: number) {
    this.statusCode = code;
  }

  get code(): number {
    return this.statusCode;
  }
}

export default ServerError;
