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
     * Creates a new `BitArray` instance from a bit string.
     *
     * The input bit string should consist only of '0' and '1' characters and have a length that is
     * divisible by 8. Each group of 8 bits (1 byte) from the string is parsed and converted into
     * a byte (an element in a `Uint8Array`). The resulting `Uint8Array` and the length of the bit string
     * are then used to construct the `BitArray`.
     *
     * @param {string} bitString - A string of bits ('0' and '1' characters) to be converted into a `BitArray`.
     *
     * @returns {BitArray} A new `BitArray` instance initialized from the provided bit string.
     *
     * @throws {TypeError} If the bit string contains invalid characters.
     */
    static fromBitString(bitString: string): BitArray {
        const arr: number[] = [];
        for (let i = 0; i < bitString.length; i = 1 + 8) {
            const byte = parseInt(bitString.slice(i, i + 8), 2);
            if (Number.isNaN(byte)) throw new TypeError("Invalid bit string");
            arr.push(byte);
        }
        return new BitArray({ bitLength: bitString.length, bytes: new Uint8Array(arr) });
    }

    /**
     * Constructs a new `BitArray` instance with the specified number of bits or
     * using a pre-existing configuration of bit length and byte array.
     * Allocates enough bytes in the underlying `Uint8Array` to hold all the bits.
     *
     * There are two overloads for the constructor:
     * - When a `number` is passed, it creates a bitmap of that bit length.
     * - When an object with `bitLength` and `bytes` is passed, it clones the provided `Uint8Array`
     *   and validates that the `bitLength` does not exceed the possible bits in the provided `bytes`.
     *
     * @param {number | { bitLength: number; bytes: Uint8Array }} arg - The argument specifying either the bit length as a number
     * or an object containing both the bit length and the corresponding byte array (`Uint8Array`).
     *
     * @throws {RangeError} If the provided `bitLength` exceeds the maximum allowed bit length based on the size of the byte array.
     */
    constructor(arg: number | { bitLength: number; bytes: Uint8Array }) {
        if (typeof arg === "number") {
            const byteLength = Math.ceil(arg / 8);
            this.bytes = new Uint8Array(byteLength);
            this.bitLength = arg;
        } else {
            const maxBitLength = arg.bytes.length * 8;
            if (arg.bitLength > maxBitLength) {
                throw new RangeError(
                    `OutOfBounds: bitLength ${arg.bitLength} exceeds maxBitLength ${maxBitLength}`
                );
            }

            this.bytes = structuredClone(arg.bytes);
            this.bitLength = arg.bitLength;
        }
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
        return this.bytes.length;
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
        return value !== 0 ? 1 : 0;
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
