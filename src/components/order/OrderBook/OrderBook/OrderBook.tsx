
import useOrderBook from "../hooks/useOrderBook";
import OrderLatestPriceBook from "./OrderLatestPriceBook";
import OrderRow from "./OrderRow";

const OrderBook = () => {
    const { orderBook } = useOrderBook('BTCPFC');

    const isEmpty = orderBook.asks.length === 0 && orderBook.bids.length === 0;

    return (
        <div className="flex flex-col items-center p-4 bg-[#131B29] text-[#F0F4F8]">
            <div className="w-80 bg-[#131B29] p-4 rounded-md shadow-md">
                <h2 className="text-lg font-bold text-left">Order Book</h2>

                {isEmpty ? (
                    <div className="flex flex-col justify-center items-center h-40 text-[#8698aa]">
                        <span>No Data Available</span>
                        <span className="mt-2 text-lg font-bold">-</span>
                        <span>No Data Available</span>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-2">
                            <table className="w-full text-sm text-[#8698aa] table-fixed border-spacing-0">
                                <thead>
                                    <tr className="text-xs">
                                        <th className="text-left w-1/3 truncate">Price (USD)</th>
                                        <th className="text-right w-1/3 truncate">Size</th>
                                        <th className="text-right w-1/3 truncate">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderBook.asks.map(({ price, size, cumulative, cumulativePercentage }, index) => (
                                        <OrderRow
                                            key={`${price}_${size}_${index}`} // key: price, size
                                            price={Number(price)}
                                            size={Number(size)}
                                            cumulative={Number(cumulative)}
                                            progressPercent={Number(cumulativePercentage)}
                                            baseTextColor={'text-[#FF5B5A]'}
                                            backgroundColor="rgba(255, 90, 90, 0.12) "
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <OrderLatestPriceBook />

                        <div className="grid grid-cols-1 gap-2">
                            <table className="w-full text-sm text-[#8698aa] table-fixed border-spacing-0">
                                <tbody>
                                    {orderBook.bids.map(({ price, size, cumulative, cumulativePercentage }, index) => (
                                        <OrderRow
                                            key={`${price}_${size}_${index}`} // key: price, size
                                            price={Number(price)}
                                            size={Number(size)}
                                            cumulative={Number(cumulative)}
                                            progressPercent={Number(cumulativePercentage)}
                                            baseTextColor={'text-[#00b15d]'}
                                            backgroundColor="rgba(16, 186, 104, 0.12)"
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};



export default OrderBook;
