import { createContext } from 'react';
import socket from '../socket/socket';

const SocketContext = createContext(socket);
export default SocketContext;
