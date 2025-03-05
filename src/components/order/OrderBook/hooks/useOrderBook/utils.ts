import type { Order } from "../../../../../types";

const MAX_QUOTES = 8;

type CalculateCumulative = (
    orders: Array<[string, number]>,
    isBids: boolean
) => Order[];

export const calculateCumulative: CalculateCumulative = (orders, isBids) => {
    // Sort and limit orders
    const sortedOrders = orders
        .sort((a, b) => isBids ? Number(b[0]) - Number(a[0]) : Number(a[0]) - Number(b[0]))
        .slice(0, MAX_QUOTES);
    // Calculate running totals
    const total = sortedOrders.reduce((sum, [, size]) => sum + size, 0);
    let cumulative = 0;
    // Map to final format
    const result = sortedOrders.map(([price, size]) => ({
        price,
        size,
        cumulative: (cumulative += size),
        cumulativePercentage: total ? (cumulative / total) * 100 : 0
    }));
    return isBids ? result : result.reverse();
};
