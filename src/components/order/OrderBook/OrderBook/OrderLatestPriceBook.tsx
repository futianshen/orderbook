import ArrowIcon from "../../../common/icons/ArrowIcon";
import useLastPrice from "../hooks/useLastPrice";

const OrderLatestPriceBook = () => {
    const { lastPrice, direction } = useLastPrice('BTCPFC');

    return <div className={`flex items-center justify-center my-2 font-bold text-lg transition-colors duration-300 bg-opacity-20 ${direction === "up" ? "bg-[#00b15d]" : "bg-[#FF5B5A]"}`}>
        <span>{lastPrice ? lastPrice.toLocaleString() : "-"}</span>
        {lastPrice && (
            <ArrowIcon
                className="ml-1"
                direction={direction}
                color={direction === "up" ? "text-[#00b15d]" : "text-[#FF5B5A]"}
                size={18}
            />
        )}
    </div>
}

export default OrderLatestPriceBook