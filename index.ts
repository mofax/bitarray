/**
 * A class that represents a bitmap using a `Uint8Array` to store bits.
 */
export class BitArray {
    /**
     * The total number of bits in the bitmap.
     */
    readonly bitLength: number;
    readonly bytes: Uint8Array;
    /**
     * Constructs a new `BitMap` with the specified number of bits.
     * Allocates enough bytes in the underlying `Uint8Array` to hold all bits.
     *
     * @param length - The number of bits in the bitmap.
     */
    constructor(length: number) {
        const byteLength = Math.ceil(length / 8);
        this.bytes = new Uint8Array(byteLength);
        this.bitLength = length;
    }
    /**
    * The total number of bits in the bitmap.
    */
    get length(): number {
        return this.bitLength;
    }
    /**
    * The total number of bytes in the bitmap.
    */
    get byteLength(): number {
        return this.bytes.length
    }
    /**
     * Returns the boolean value of the bit at the given index.
     *
     * @param index - The index of the bit to retrieve.
     * @returns 1 or 0.
     *
     * @throws {RangeError} If the index is out of bounds (i.e., greater than or equal to `bitLength`).
     */
    at(index: number): 1 | 0 {
        if (index >= this.bitLength) {
            throw new RangeError(
                `OutOfBounds: cannot read index ${index} in bitmap of length ${this.bitLength}`
            );
        }
        const value = this.bytes[index >> 3] & (1 << (index & 7));
        return value !== 0 ? 1 : 0
    }
    /**
     * Sets the bit at the given index to `1`.
     *
     * @param index - The index of the bit to set.
     *
     * @throws {RangeError} If the index is out of bounds (i.e., greater than or equal to `bitLength`).
     */
    set1(index: number): void {
        if (index >= this.bitLength) {
            throw new RangeError(
                `OutOfBounds: cannot set index ${index} in bitmap of length ${this.bitLength}`
            );
        }
        this.bytes[index >> 3] |= 1 << (index & 7);
    }

    /**
     * A generator that streams the bits of the `BitMap`, starting from the first bit (index 0).
     *
     * @yields `true` for each set bit (1) and `false` for each unset bit (0).
     *
     * @example
     * ```ts
     * const bitMap = new BitMap(16);
     * bitMap.setBit(0);
     * bitMap.setBit(5);
     * for (const bit of bitMap.streamBits()) {
     *   console.log(bit); // true for set bits, false for unset bits
     * }
     * ```
     */
    *streamBits(): Generator<1 | 0> {
        for (let index = 0; index < this.bitLength; index++) {
            yield this.at(index);
        }
    }
}
