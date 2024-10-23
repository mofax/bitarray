# BitArray

A lightweight and efficient TypeScript implementation of a bitmap using `Uint8Array` for compact bit storage and manipulation.

## Features

- 🚀 Efficient bit-level operations
- 📦 Compact memory usage with `Uint8Array`
- 🔄 Bit streaming capabilities
- 💪 Type-safe implementation in TypeScript
- ⚡ Fast bit access and manipulation

## Installation

```bash
npx jsr add @mofax/bitarray
```

## Usage

### Basic Operations

```typescript
// Create a new BitArray with 16 bits
const bits = new BitArray(16);

// Set individual bits
bits.set1(0);  // Set first bit
bits.set1(5);  // Set sixth bit

// Read bits
console.log(bits.at(0));  // Output: 1
console.log(bits.at(1));  // Output: 0

// Get array length in bits
console.log(bits.length);     // Output: 16

// Get array length in bytes
console.log(bits.byteLength); // Output: 2
```

### Streaming Bits

You can iterate through all bits using the `streamBits()` generator:

```typescript
const bits = new BitArray(8);
bits.set1(0);
bits.set1(3);
bits.set1(7);

for (const bit of bits.streamBits()) {
    console.log(bit); // Outputs: 1, 0, 0, 1, 0, 0, 0, 1
}
```

## Uint8Array

BitArray stores bits in a compact format using `Uint8Array`. Each byte can store 8 bits.

- 8 bits -> 1 byte
- 16 bits -> 2 bytes
- 1000 bits -> 125 bytes

## API Highlights

- `constructor(length: number)`: Create a new BitArray with specified length
- `at(index: number)`: Get the value of a bit at specific index (returns 0 or 1)
- `set1(index: number)`: Set a bit to 1 at specific index
- `streamBits()`: Generator function to iterate through all bits
- `length`: Get total number of bits
- `byteLength`: Get total number of bytes used for storage

## Error Handling

The implementation includes bounds checking to prevent access outside the allocated space:

```typescript
const bits = new BitArray(8);
bits.at(10); // Throws RangeError: OutOfBounds
bits.set1(10); // Throws RangeError: OutOfBounds
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License
