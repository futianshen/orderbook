import { useCallback, useState } from "react";
import useWebSocket from "../../../../../hooks/useWebsocket";
import { calculateCumulative } from "./utils";
import type { Order } from "../../../../../types";

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

const useOrderBook = (symbol: string) => {
    const [orderBook, setOrderBook] = useState<OrderBook>({ bids: [], asks: [] });
    const [seqNum, setSeqNum] = useState<number | null>(null);

    useWebSocket<WebSocketMessage>(`wss://ws.btse.com/ws/oss/futures`, `update:${symbol}_0`, useCallback(({ data }) => {
        if (!data) return;

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
            if (typeof seqNum === 'number' && data.prevSeqNum !== seqNum) {
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
