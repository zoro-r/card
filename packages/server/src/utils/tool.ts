export function success(data: any, message: string = 'success') {
  return {
    code: 200,
    data,
    message,
  }
}

export function fail(message: string = 'fail') {
  return {
    code: -1,
    message,
  }
}

export function error(message: string = 'error', err?: any) {
  return {
    code: -1,
    message,
    error: err?.message || err,
  }
}
