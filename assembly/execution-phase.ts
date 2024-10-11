import {
  Bytes,
  Console,
  Process,
  httpFetch,
  u128,
} from "@seda-protocol/as-sdk/assembly";
import { median } from "./helpers";

@json
class SpreadProfilePrice {
  spreadProfile!: string;
  bidSpread!: string;
  bid!: f64;
}

@json
class PriceData {
  spreadProfilePrices!: SpreadProfilePrice[];
  ts!: string;
}

/**
 * Executes the data request phase within the SEDA network.
 * This phase is responsible for fetching non-deterministic data (e.g., price of an asset pair)
 * from an external source such as a price feed API. The input specifies the asset pair to fetch.
 */
export function executionPhase(): void {
  // Make an HTTP request to a price feed API to get the price for the symbol pair.
  // The URL is dynamically constructed using the provided symbols (e.g., ETHUSDC).
  const response = httpFetch(
    `https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/XAG/USD`
  );

  // Check if the HTTP request was successfully fulfilled.
  if (!response.ok) {
    // Handle the case where the HTTP request failed or was rejected.
    Console.error(
      `HTTP Response was rejected: ${response.status.toString()} - ${response.bytes.toUtf8String()}`
    );
    // Report the failure to the SEDA network with an error code of 1.
    Process.error(Bytes.fromUtf8String("Error while fetching price feed"));
  }

  // Parse the API response as defined earlier.

  const responseAsJson = response.bytes.toJSON<PriceData[]>();
  
  const bidPrices: u128[] = [];

  for (let i = 0; i < responseAsJson.length; i++){ 
    const dataSubSet = responseAsJson[i];
    for (let n = 0; n < dataSubSet.spreadProfilePrices.length; n++) {
      const priceFloat: f64 = dataSubSet.spreadProfilePrices[n].bid;
      if (isNaN(priceFloat)) {
        // Report the failure to the SEDA network with an error code of 1.
        Process.error(Bytes.fromUtf8String(`Error while parsing price data: ${dataSubSet.spreadProfilePrices[n].bid}`));
      }
      // Convert to integer but multiply by 10000 to retain 4 decimal precision
      const priceInt = u128.from(priceFloat * 10000);
      bidPrices.push(priceInt)
    }
  }
  
  
  const medianBid = median(bidPrices);

  // Report the successful result back to the SEDA network.
  Process.success(Bytes.fromNumber<u128>(medianBid));
}
