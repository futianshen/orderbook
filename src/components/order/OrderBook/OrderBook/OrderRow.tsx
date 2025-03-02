import type { FC } from "react";
import { useEffect, useState } from "react";

const FLASH_DURATION = 500;

const useFlash = (value: number) => {
    const [prevValue, setPrevValue] = useState(value);
    const [flashClass, setFlashClass] = useState("");

    useEffect(() => {
        if (value !== prevValue) {
            if (value > prevValue) {
                setFlashClass("bg-[rgba(16,186,104,0.12)] text-[#00b15d]");
            } else if (value < prevValue) {
                setFlashClass("bg-[rgba(255,90,90,0.12)] text-[#FF5B5A]");
            }
            const timer = setTimeout(() => {
                setFlashClass("");
            }, FLASH_DURATION);
            setPrevValue(value);
            return () => clearTimeout(timer);
        }
    }, [value, prevValue]);

    return flashClass;
};

type Props = {
    price: number;
    size: number;
    cumulative: number;
    progressPercent: number;
    baseTextColor: string;
    backgroundColor: string
}

const OrderRow: FC<Props> = ({ price, size, cumulative, progressPercent, baseTextColor, backgroundColor }) => {
    const flashClass = useFlash(cumulative);

    return <tr className={`${baseTextColor} hover:bg-[#1E3059] ${flashClass}`}>
        <td className="text-left truncate relative">
            {Number(price).toLocaleString()}
        </td>
        <td className={`text-right truncate ${flashClass}`}>{Number(size).toLocaleString()}</td>
        <td className="text-right truncate relative">
            <div
                className="absolute inset-y-0 right-0"
                style={{
                    width: `${progressPercent}%`,
                    backgroundColor
                }}
            />
            <span className="relative">{Number(price).toLocaleString()}</span>
        </td>
    </tr>
};

export default OrderRow;
