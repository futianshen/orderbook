import { calculateCumulative } from "./utils";

// Snapshot sample 測試：Bids 部分
test("snapshot sample - bids", () => {
  const bids: [string, number][] = [
    ["59252.5", 0.06865],
    ["59249.0", 0.24000],
    ["59235.5", 0.16073],
    ["59235.0", 0.26626],
    ["59233.0", 0.50000],
  ];
  const totalSize = 0.06865 + 0.24000 + 0.16073 + 0.26626 + 0.50000; // 1.23564
  const expected = [
    {
      price: "59252.5",
      size: 0.06865,
      cumulative: 0.06865,
      cumulativePercentage: (0.06865 / totalSize) * 100,
    },
    {
      price: "59249.0",
      size: 0.24000,
      cumulative: 0.06865 + 0.24000,
      cumulativePercentage: (0.30865 / totalSize) * 100,
    },
    {
      price: "59235.5",
      size: 0.16073,
      cumulative: 0.06865 + 0.24000 + 0.16073,
      cumulativePercentage: (0.46938 / totalSize) * 100,
    },
    {
      price: "59235.0",
      size: 0.26626,
      cumulative: 0.06865 + 0.24000 + 0.16073 + 0.26626,
      cumulativePercentage: (0.73564 / totalSize) * 100,
    },
    {
      price: "59233.0",
      size: 0.50000,
      cumulative: 0.06865 + 0.24000 + 0.16073 + 0.26626 + 0.50000,
      cumulativePercentage: 100,
    },
  ];
  const result = calculateCumulative(bids, true);
  expect(result).toHaveLength(5);
  result.forEach((order, idx) => {
    expect(order.price).toBe(expected[idx].price);
    expect(order.size).toBeCloseTo(expected[idx].size, 5);
    expect(order.cumulative).toBeCloseTo(expected[idx].cumulative, 5);
    expect(order.cumulativePercentage).toBeCloseTo(expected[idx].cumulativePercentage, 5);
  });
});

// Snapshot sample 測試：Asks 部分
test("snapshot sample - asks", () => {
  const asks: [string, number][] = [
    ["59292.0", 0.50000],
    ["59285.5", 0.24000],
    ["59285.0", 0.15598],
    ["59278.5", 0.01472],
  ];
  // 函式對 asks：先由低到高排序 → 累計 → 再 .reverse()
  // 原始價格由低到高應該是：59278.5, 59285.0, 59285.5, 59292.0
  // 反轉後最終輸出：59292.0, 59285.5, 59285.0, 59278.5
  const totalSize = 0.50000 + 0.24000 + 0.15598 + 0.01472; // 0.91070

  // 最終陣列(高到低)時，第一筆是最高價 59292.0
  // 請注意，累計計算時是「先從最低開始加」，但最後輸出順序被反轉
  const expected = [
    {
      price: "59292.0",
      size: 0.50000,
      cumulative: totalSize,
      cumulativePercentage: 100,
    },
    {
      price: "59285.5",
      size: 0.24000,
      cumulative: 0.41070,
      cumulativePercentage: (0.41070 / totalSize) * 100,
    },
    {
      price: "59285.0",
      size: 0.15598,
      cumulative: 0.17070,
      cumulativePercentage: (0.17070 / totalSize) * 100,
    },
    {
      price: "59278.5",
      size: 0.01472,
      cumulative: 0.01472,
      cumulativePercentage: (0.01472 / totalSize) * 100,
    },
  ];
  const result = calculateCumulative(asks, false);
  expect(result).toHaveLength(4);
  result.forEach((order, idx) => {
    expect(order.price).toBe(expected[idx].price);
    expect(order.size).toBeCloseTo(expected[idx].size, 5);
    expect(order.cumulative).toBeCloseTo(expected[idx].cumulative, 5);
    expect(order.cumulativePercentage).toBeCloseTo(expected[idx].cumulativePercentage, 5);
  });
});

// Delta sample 測試：Asks 含零筆數情形
test("delta sample - asks with zero size", () => {
  const orders: [string, number][] = [
    ["59367.5", 2.15622],
    ["59325.5", 0],
  ];
  const expected = [
    {
      price: "59367.5",
      size: 2.15622,
      cumulative: 2.15622,
      cumulativePercentage: 100,
    },
    {
      price: "59325.5",
      size: 0,
      cumulative: 0,
      cumulativePercentage: 0,
    },
  ];
  const result = calculateCumulative(orders, false);
  expect(result).toHaveLength(2);
  result.forEach((order, idx) => {
    expect(order.price).toBe(expected[idx].price);
    expect(order.size).toBeCloseTo(expected[idx].size, 5);
    expect(order.cumulative).toBeCloseTo(expected[idx].cumulative, 5);
    expect(order.cumulativePercentage).toBeCloseTo(expected[idx].cumulativePercentage, 5);
  });
});

test("more than 8 bids", () => {
  const orders: [string, number][] = [];
  // 建立 10 筆買單，價格由高到低
  for (let i = 0; i < 10; i++) {
    orders.push([(100 - i).toString(), i + 1]); // size: 1, 2, …, 10
  }
  // 取前 8 筆計算
  const sliced = orders.slice(0, 8);
  const totalSize = sliced.reduce((sum, [, size]) => sum + size, 0);
  let cumulative = 0;
  const expected = sliced.map(([price, size]) => {
    cumulative += size;
    return {
      price,
      size,
      cumulative,
      cumulativePercentage: (cumulative / totalSize) * 100,
    };
  });
  const result = calculateCumulative(orders, true);
  expect(result).toHaveLength(8);
  result.forEach((order, idx) => {
    expect(order.price).toBe(expected[idx].price);
    expect(order.size).toBe(expected[idx].size);
    expect(order.cumulative).toBe(expected[idx].cumulative);
    expect(order.cumulativePercentage).toBeCloseTo(expected[idx].cumulativePercentage, 5);
  });
});

// 測試：資料超過 8 筆，賣單只取前 8 筆處理
test("more than 8 asks", () => {
  const orders: [string, number][] = [];
  // 建立 10 筆賣單，價格由低到高
  for (let i = 0; i < 10; i++) {
    orders.push([(100 + i).toString(), i + 1]);
  }
  // 取前 8 筆
  const sliced = orders.slice(0, 8);
  const totalSize = sliced.reduce((sum, [, size]) => sum + size, 0);
  const ascendingCalc = [
    { price: "100", size: 1, cumulative: 1 },
    { price: "101", size: 2, cumulative: 3 },
    { price: "102", size: 3, cumulative: 6 },
    { price: "103", size: 4, cumulative: 10 },
    { price: "104", size: 5, cumulative: 15 },
    { price: "105", size: 6, cumulative: 21 },
    { price: "106", size: 7, cumulative: 28 },
    { price: "107", size: 8, cumulative: 36 },
  ];
  const expected = ascendingCalc
    .map(item => ({
      ...item,
      cumulativePercentage: (item.cumulative / totalSize) * 100,
    }))
    .reverse();
  const result = calculateCumulative(orders, false);
  expect(result).toHaveLength(8);
  result.forEach((order, idx) => {
    expect(order.price).toBe(expected[idx].price);
    expect(order.size).toBe(expected[idx].size);
    expect(order.cumulative).toBe(expected[idx].cumulative);
    expect(order.cumulativePercentage).toBeCloseTo(expected[idx].cumulativePercentage, 5);
  });
});

// 測試：空的 orders 應回傳空陣列
test("empty orders", () => {
  expect(calculateCumulative([], true)).toEqual([]);
  expect(calculateCumulative([], false)).toEqual([]);
});
