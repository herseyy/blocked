import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// Create a context to store the Socket.IO connection
const SocketContext = createContext(null);

// Custom hook to use the Socket.IO context
export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Initialize Socket.IO connection
        const newSocket = io('http://localhost:3000'); // Replace with your server URL

        // Set up socket event listeners
        newSocket.on('connect', () => {
            console.log('Socket connected: ', newSocket.id);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        // Set the socket instance to state
        setSocket(newSocket);

        // Clean up on component unmount
        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
