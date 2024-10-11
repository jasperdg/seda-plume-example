import { u128 } from "@seda-protocol/as-sdk/assembly";

/**
 * Function to calculate the median of an array of unsigned integers.
 * @param numbers - Array of u64 numbers
 * @returns The median value
 */
export function median(numbers: u128[]): u128 {
    const sorted: u128[] = numbers.sort();
    const middle = i32(Math.floor(sorted.length / 2));
  
    if (sorted.length % 2 === 0) {
      return u128.div(u128.add(sorted[middle - 1], sorted[middle]), u128.from(2));
    }
  
    return sorted[middle];
  }
  