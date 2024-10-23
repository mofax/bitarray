import { describe, expect, it } from "bun:test";
import { BitArray as BitMap } from "./index";

describe("BitMap", () => {
    describe("constructor", () => {
        it("should create a BitMap with the correct length", () => {
            const bitMap = new BitMap(16);
            expect(bitMap.length).toBe(16);
            expect(bitMap.byteLength).toBe(2); // 16 bits should result in 2 bytes
        });

        it("should handle non-multiple of 8 bit lengths", () => {
            const bitMap = new BitMap(10);
            expect(bitMap.byteLength).toBe(2); // 10 bits should also use 2 bytes
        });

        it("should handle large bit lengths", () => {
            const bitMap = new BitMap(1024);
            expect(bitMap.byteLength).toBe(128); // 1024 bits should use 128 bytes
        });

        it("should handle 0 bit length", () => {
            const bitMap = new BitMap(0);
            expect(bitMap.length).toBe(0);
        });
    });

    describe("at", () => {
        it("should return 0 for unset bits", () => {
            const bitMap = new BitMap(16);
            expect(bitMap.at(0)).toBe(0);
            expect(bitMap.at(15)).toBe(0);
        });

        it("should return 1 for set bits", () => {
            const bitMap = new BitMap(16);
            bitMap.set1(0);
            expect(bitMap.at(0)).toBe(1);
        });

        it("should throw for out of bounds bit access", () => {
            const bitMap = new BitMap(16);
            expect(() => bitMap.at(16)).toThrow(RangeError);
        });

        it("should handle boundary bits", () => {
            const bitMap = new BitMap(16);
            bitMap.set1(15); // Last bit of a 16-bit BitMap
            expect(bitMap.at(15)).toBe(1);
            expect(bitMap.at(14)).toBe(0);
        });
    });

    describe("set1", () => {
        it("should correctly set the bit", () => {
            const bitMap = new BitMap(16);
            bitMap.set1(5);
            expect(bitMap.at(5)).toBe(1);
        });

        it("should not affect other bits when setting a bit", () => {
            const bitMap = new BitMap(16);
            bitMap.set1(5);
            expect(bitMap.at(4)).toBe(0);
            expect(bitMap.at(6)).toBe(0);
        });

        it("should handle setting the last bit", () => {
            const bitMap = new BitMap(16);
            bitMap.set1(15);
            expect(bitMap.at(15)).toBe(1);
        });

        it("should handle setting bits at byte boundaries", () => {
            const bitMap = new BitMap(16);
            bitMap.set1(7); // Last bit of the first byte
            bitMap.set1(8); // First bit of the second byte
            expect(bitMap.at(7)).toBe(1);
            expect(bitMap.at(8)).toBe(1);
        });

        it("should throw for out of bounds bit set", () => {
            const bitMap = new BitMap(16);
            expect(() => bitMap.set1(16)).toThrow("OutOfBounds");
        });
    });

    describe("stress test", () => {
        it("should handle setting and getting a large number of bits", () => {
            const bitMap = new BitMap(1024); // 1024 bits (128 bytes)
            for (let i = 0; i < 1024; i++) {
                bitMap.set1(i);
                expect(bitMap.at(i)).toBe(1);
            }
        });

        it("should handle alternating set bits in a large BitMap", () => {
            const bitMap = new BitMap(1024); // 1024 bits (128 bytes)
            for (let i = 0; i < 1024; i += 2) {
                bitMap.set1(i);
            }

            for (let i = 0; i < 1024; i++) {
                if (i % 2 === 0) {
                    expect(bitMap.at(i)).toBe(1);
                } else {
                    expect(bitMap.at(i)).toBe(0);
                }
            }
        });
    });

    describe("streamBits", () => {
        it("should stream all bits as 0 when no bits are set", () => {
            const bitMap = new BitMap(16);
            const bits = Array.from(bitMap.streamBits());
            expect(bits.length).toBe(16); // We expect 16 bits
            expect(bits.every((bit) => bit === 0)).toBe(true); // All bits should be 0
        });

        it("should stream the correct bits when some bits are set", () => {
            const bitMap = new BitMap(16);
            bitMap.set1(0); // Set the first bit
            bitMap.set1(5); // Set the sixth bit
            bitMap.set1(15); // Set the last bit

            const bits = Array.from(bitMap.streamBits());
            expect(bits.length).toBe(16);
            expect(bits[0]).toBe(1); // First bit is set
            expect(bits[5]).toBe(1); // Sixth bit is set
            expect(bits[15]).toBe(1); // Last bit is set

            // All other bits should be 0
            for (let i = 1; i < 5; i++) {
                expect(bits[i]).toBe(0);
            }
            for (let i = 6; i < 15; i++) {
                expect(bits[i]).toBe(0);
            }
        });

        it("should correctly stream bits across byte boundaries", () => {
            const bitMap = new BitMap(16);
            bitMap.set1(7); // Set the last bit of the first byte
            bitMap.set1(8); // Set the first bit of the second byte

            const bits = Array.from(bitMap.streamBits());
            expect(bits.length).toBe(16);
            expect(bits[7]).toBe(1); // Last bit of the first byte is set
            expect(bits[8]).toBe(1); // First bit of the second byte is set

            // Other bits should be 0
            for (let i = 0; i < 7; i++) {
                expect(bits[i]).toBe(0);
            }
            for (let i = 9; i < 16; i++) {
                expect(bits[i]).toBe(0);
            }
        });

        it("should stream the correct number of bits even for non-multiples of 8", () => {
            const bitMap = new BitMap(10); // 10 bits
            bitMap.set1(0);
            bitMap.set1(9); // Set the first and last bit

            const bits = Array.from(bitMap.streamBits());
            expect(bits.length).toBe(10); // Should only stream 10 bits
            expect(bits[0]).toBe(1); // First bit is set
            expect(bits[9]).toBe(1); // Last bit is set

            // Other bits should be 0
            for (let i = 1; i < 9; i++) {
                expect(bits[i]).toBe(0);
            }
        });

        it("should handle large BitMaps and stream all bits correctly", () => {
            const bitMap = new BitMap(1024); // 1024 bits
            bitMap.set1(0);
            bitMap.set1(512);
            bitMap.set1(1023);

            const bits = Array.from(bitMap.streamBits());
            expect(bits.length).toBe(1024);
            expect(bits[0]).toBe(1); // First bit is set
            expect(bits[512]).toBe(1); // Middle bit is set
            expect(bits[1023]).toBe(1); // Last bit is set

            // Other bits should be 0
            for (let i = 1; i < 512; i++) {
                expect(bits[i]).toBe(0);
            }
            for (let i = 513; i < 1023; i++) {
                expect(bits[i]).toBe(0);
            }
        });
    });
});
