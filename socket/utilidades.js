export const expressMiddlewareAdapter = (middleware) => async (socket, next) => {

  try{
    await middleware(socket.handshake, {}, next);
  }catch(e){
    next(e);
  }
}

export const createOnEvents = (socket, namespace, handlersObject) => {
  if (!handlersObject) return;
  Object.entries(handlersObject).forEach(([name, handler]) => {
    const evento = `${namespace}/${name}`
    socket.on(`${namespace}/${name}`, handler(socket,evento))
  })
}

export const createOnceEvents = (socket, namespace, handlersObject) => {
  if (!handlersObject) return;
  Object.entries(handlersObject).forEach(([name, handler]) => socket.once(`${namespace}/${name}`, handler(socket)))
}

export const useEvents = (socket, namespace, handlersObject) => {
  if (!handlersObject) return;
  createOnEvents(socket, namespace, handlersObject.onEvents)
  createOnceEvents(socket, namespace, handlersObject.onceEvents)
}