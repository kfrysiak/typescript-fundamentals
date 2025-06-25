export class ErrorWithPayload<Payload> extends Error {
  payload: Payload;

  constructor(message: string, payload: Payload) {
    super(message);
    this.payload = payload;
  }
}
