import type { Order } from "../../../../../types";

const MAX_QUOTES = 8;

type CalculateCumulative = (
    orders: Array<[string, number]>,
    isBids: boolean
) => Order[];

export const calculateCumulative: CalculateCumulative = (orders, isBids) => {
    const sorted = orders.sort((a, b) =>
        isBids ? Number(b[0]) - Number(a[0]) : Number(a[0]) - Number(b[0])
    );
    const sliced = sorted.slice(0, MAX_QUOTES);
    const totalSize = sliced.reduce((sum, [, size]) => sum + size, 0);
    let cumulative = 0;
    const result = sliced.map(([price, size]) => {
        cumulative += size;
        return {
            price,
            size,
            cumulative,
            cumulativePercentage: totalSize ? (cumulative / totalSize) * 100 : 0,
        };
    });
    return isBids ? result : result.reverse();
};
