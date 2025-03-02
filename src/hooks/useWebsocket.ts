import { useCallback, useEffect, useRef, useState } from 'react';

const useWebSocket = <T>(url: string, topic: string, onMessage: (data: T) => void) => {
    const wsRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const handleMessage = useCallback(onMessage, [])

    const connect = useCallback(() => {
        if (wsRef.current) return;

        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
            setIsConnected(true);
            ws.send(JSON.stringify({ op: 'subscribe', args: [topic] }));
        };

        ws.onmessage = (event) => {
            const response = JSON.parse(event.data) as T;
            handleMessage(response);
        };

        ws.onclose = () => {
            setIsConnected(false);
            wsRef.current = null;
            setTimeout(connect, 5000); // Auto-reconnect after 5s
        };

        ws.onerror = (error) => {
            console.error(`WebSocket error on ${topic}:`, error);
            ws.close();
        };
    }, [url, topic, handleMessage]);

    useEffect(() => {
        connect();
        return () => {
            wsRef.current?.close();
        };
    }, [connect]);

    return { isConnected };
};

export default useWebSocket