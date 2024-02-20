export class NotAvailableError extends Error {
  constructor(message: string = '') {
    super('Not Available Error: ' + message)
  }
}
