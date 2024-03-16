import { io } from 'socket.io-client';

export const socket =
  process.env.NODE_ENV === 'production'
    ? io('', { path: '/socket', autoConnect: false })
    : io('http://localhost:3000', { path: '/socket', autoConnect: false });
