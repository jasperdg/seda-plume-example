import { JSON, httpFetch } from "@seda-protocol/as-sdk/assembly";
import { Result } from "./result";

@json
class KucoinData {
    price!: string;
}

@json
class KucoinResponse {
    data!: KucoinData;
}

export function fetchKucoin(a: string, b: string): Result {
    const promise = httpFetch(
        `https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${a.toUpperCase()}-${b.toUpperCase()}`
    );

    const fulfilled = promise.fulfilled;

    if (fulfilled !== null) {
        const data = String.UTF8.decode(fulfilled.bytes.buffer);
        const response = JSON.parse<KucoinResponse>(data);

        return Result.success(response.data.price);
    }

    let message = "Failed to fetch Kucoin price";
    const rejected = promise.rejected;
    if (rejected) {
        const error = String.UTF8.decode(rejected.bytes.buffer);
        message = message + `: ${error}`;
    }

    return Result.failure(message);
}