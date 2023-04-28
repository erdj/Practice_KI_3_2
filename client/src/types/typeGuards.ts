export const isWebSocket = (
  socket: React.MutableRefObject<WebSocket | null>,
): socket is React.MutableRefObject<WebSocket> => {
  return Boolean(socket.current);
};
