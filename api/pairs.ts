import { VercelRequest, VercelResponse } from "@vercel/node";
import { getAddress } from "@ethersproject/address";
import { getTopPairs } from "../utils";
import { return200, return500 } from "../utils/response";

interface ReturnShape {
  [tokenIds: string]: {
    pair_address: string;
    base_name: string;
    base_symbol: string;
    base_address: string;
    quote_name: string;
    quote_symbol: string;
    quote_address: string;
    price: string;
    base_volume: string;
    quote_volume: string;
    liquidity: string;
    liquidity_CRO: string;
  };
}

const lastUpdated = Date.now();
let updating = false
let localPairs = {};

export default async function (req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    if (Object.keys(localPairs).length >= 0 && (Date.now() < lastUpdated + 3 * 60 * 1000 || updating)) {
      return200(res, localPairs);
    }

    updating = true; // because single request take a long time
    const topPairs = await getTopPairs();

    localPairs = topPairs.reduce<ReturnShape>((accumulator, pair): ReturnShape => {
      const pId = getAddress(pair.id);
      const t0Id = getAddress(pair.token0.id);
      const t1Id = getAddress(pair.token1.id);

      accumulator[`${t0Id}_${t1Id}`] = {
        pair_address: pId,
        base_name: pair.token0.name,
        base_symbol: pair.token0.symbol,
        base_address: t0Id,
        quote_name: pair.token1.name,
        quote_symbol: pair.token1.symbol,
        quote_address: t1Id,
        price: pair.price,
        base_volume: pair.previous24hVolumeToken0,
        quote_volume: pair.previous24hVolumeToken1,
        liquidity: pair.reserveUSD,
        liquidity_CRO: pair.reserveCRO,
      };

      return accumulator;
    }, {});

    updating = false;

    return200(res, { updated_at: new Date().getTime(), data: localPairs });
  } catch (error) {
    return500(res, <Error>error);
  }
}
