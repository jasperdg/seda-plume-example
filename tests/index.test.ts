import { afterEach, describe, it, expect, mock } from "bun:test";
import { file } from "bun";
import { testOracleProgramExecution, testOracleProgramTally } from "@seda-protocol/dev-tools"
import { BigNumber } from 'bignumber.js'
import mockdata from "./mockdata.js";

const WASM_PATH = "build/debug.wasm";

const fetchMock = mock();

afterEach(() => {
  fetchMock.mockRestore();
});

describe("data request execution", () => {
  console.log(JSON.stringify(mockdata))
  it("should aggregate the results from the different APIs", async () => {
    fetchMock.mockImplementation((url) => {
      if (url.host === "forex-data-feed.swissquote.com") {
        return new Response(JSON.stringify(mockdata));
      }

      return new Response('Unknown request');
    });
    
    const oracleProgram = await file(WASM_PATH).arrayBuffer();

    const vmResult = await testOracleProgramExecution(
      Buffer.from(oracleProgram),
      Buffer.from([]),
      fetchMock
    );

    console.log(vmResult)

    expect(vmResult.exitCode).toBe(0);
    // BigNumber.js is big endian
    const hex = Buffer.from(vmResult.result.toReversed()).toString('hex');
    const result = BigNumber(`0x${hex}`);
    console.log(result)
    // expect(result).toEqual(BigNumber('2452300032'));
  });
});
