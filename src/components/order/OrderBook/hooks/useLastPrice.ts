import { useState } from "react";
import useWebSocket from "../../../../hooks/useWebsocket";

type TradeData = {
    data: {
        price: number;
        side: 'BUY' | 'SELL';
    }[];
}

const useLastPrice = (symbol: string) => {
    const [lastPrice, setLastPrice] = useState<number | null>(null);
    const [direction, setDirection] = useState<'up' | 'down'>('up')

    useWebSocket<TradeData>(`wss://ws.btse.com/ws/futures`, `tradeHistoryApi:${symbol}`, ({ data }) => {
        if (!data || !data.length) return;
        const { price, side } = data[0]

        setLastPrice(price);
        setDirection(side === 'BUY' ? 'up' : 'down')
    });

    return { lastPrice, direction };
};

export default useLastPrice