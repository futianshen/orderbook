import { useCallback, useState } from "react";
import useWebSocket from "../../../../hooks/useWebsocket";

type Order = {
    price: string;
    size: number;
    cumulative: number;
    cumulativePercentage: number;
}

type OrderBook = {
    bids: Order[];
    asks: Order[];
}

type SnapshotData = {
    type: 'snapshot';
    seqNum: number;
    bids: [string, string][];
    asks: [string, string][];
}

type DeltaData = {
    type: 'delta';
    seqNum: number;
    prevSeqNum: number;
    bids: [string, string][];
    asks: [string, string][];
}

type WebSocketMessage = {
    data: SnapshotData | DeltaData;
}

const MAX_QUOTES = 8;

const useOrderBook = (symbol: string) => {
    const [orderBook, setOrderBook] = useState<OrderBook>({ bids: [], asks: [] });
    const [seqNum, setSeqNum] = useState<number | null>(null);

    useWebSocket<WebSocketMessage>(`wss://ws.btse.com/ws/oss/futures`, `update:${symbol}_0`, useCallback(({ data }) => {
        if (!data) return;

        const calculateCumulative = (orders: Array<[string, number]>, isBids: boolean): Order[] => {
            if (isBids) {
                orders.sort((a, b) => Number(b[0]) - Number(a[0])); // 買單：高到低排序
                orders = orders.slice(0, MAX_QUOTES);
                const totalSize = orders.reduce((sum, order) => sum + order[1], 0);
                let cumulative = 0;
                return orders.map(([price, size]) => {
                    cumulative += size;
                    const cumulativePercentage = totalSize > 0 ? (cumulative / totalSize) * 100 : 0;
                    return { price, size, cumulative, cumulativePercentage };
                });
            } else {
                orders.sort((a, b) => Number(a[0]) - Number(b[0])); // 賣單：低到高排序
                orders = orders.slice(0, MAX_QUOTES);
                const totalSize = orders.reduce((sum, order) => sum + order[1], 0);
                let cumulative = 0;
                const cumulativeArray = orders.map(([price, size]) => {
                    cumulative += size;
                    const cumulativePercentage = totalSize > 0 ? (cumulative / totalSize) * 100 : 0;
                    return { price, size, cumulative, cumulativePercentage };
                });
                return cumulativeArray.reverse(); // 反轉後，陣列最前面累計量最大
            }
        };

        if (data.type === 'snapshot') {
            // 處理快照：先轉換 size 為 number，再計算累計數據
            const bids = calculateCumulative(
                data.bids.map(([price, size]: [string, string]) => [price, Number(size)]),
                true
            );
            const asks = calculateCumulative(
                data.asks.map(([price, size]: [string, string]) => [price, Number(size)]),
                false
            );
            setOrderBook({ bids, asks });
            setSeqNum(data.seqNum);
        }

        if (data.type === 'delta') {
            // 若序號不連續，則不處理 delta 更新
            if (seqNum !== null && data.prevSeqNum !== seqNum) {
                console.warn("Out of order update received. Resubscribing...");
                return;
            }

            // 根據現有 orders 與更新數據計算新的 orders
            const updateOrderBook = (
                currentOrders: Order[],
                updates: [string, string][],
                isBids: boolean
            ): Order[] => {
                // 將當前 orders 轉為 Map，鍵為 price，值為 size
                const orderMap = new Map<string, number>(currentOrders.map((order) => [order.price, order.size]));
                updates.forEach(([price, size]) => {
                    if (size === "0") {
                        orderMap.delete(price);
                    } else {
                        orderMap.set(price, Number(size));
                    }
                });
                // Map 轉為陣列，並利用 calculateCumulative 重新計算累計資訊
                const orders = Array.from(orderMap.entries());
                return calculateCumulative(orders, isBids);
            };

            setOrderBook((prev) => {
                const updatedBids = updateOrderBook(prev.bids, data.bids, true);
                const updatedAsks = updateOrderBook(prev.asks, data.asks, false);
                return { bids: updatedBids, asks: updatedAsks };
            });
            setSeqNum(data.seqNum);
        }
    }, []));

    return { orderBook };
};

export default useOrderBook;
