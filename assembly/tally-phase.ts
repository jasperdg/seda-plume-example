import { Tally, Process, Bytes, u128, Console } from "@seda-protocol/as-sdk/assembly";
import { median } from "./helpers";

/**
 * Executes the tally phase within the SEDA network.
 * This phase aggregates the results (e.g., price data) revealed during the execution phase,
 * calculates the median value, and submits it as the final result.
 * Note: The number of reveals depends on the replication factor set in the data request parameters.
 */
export function tallyPhase(): void {
  // Tally inputs can be retrieved from Process.getInputs(), though it is unused in this example.
  // const tallyInputs = Process.getInputs();

  // Retrieve consensus reveals from the tally phase.
  const reveals = Tally.getReveals();
  const prices: u128[] = [];

  // Iterate over each reveal, parse its content as an unsigned integer (u64), and store it in the prices array.
  for (let i = 0; i < reveals.length; i++) {
    const price = reveals[i].reveal.toU128();
    prices.push(price);
  }

  if (prices.length > 0) {
    // If there are valid prices revealed, calculate the median price from price reports.
    const finalPrice = median(prices);

    // Report the successful result in the tally phase, encoding the result as bytes.
    // Encoding result with big endian to decode from EVM contracts.
    Process.success(Bytes.fromNumber<u128>(finalPrice, true));
  } else {
    // If no valid prices were revealed, report an error indicating no consensus.
    Process.error(Bytes.fromUtf8String("No consensus among revealed results"));
  }
}

