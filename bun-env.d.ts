// bun-env.d.ts
declare global {
    function describe(description: string, callback: () => void): void;
    function it(description: string, callback: () => void): void;
    function test(description: string, callback: () => void): void;
    function beforeAll(callback: () => void): void;
    function afterAll(callback: () => void): void;
    function beforeEach(callback: () => void): void;
    function afterEach(callback: () => void): void;
    var expect: {
        (actual: any): {
            toBe(expected: any): void;
            toEqual(expected: any): void;
            toBeCloseTo(expected: number, precision?: number): void;
            toHaveLength(expect: any): void
        };
    };
}

export { };
