import { VercelRequest, VercelResponse } from "@vercel/node";
import { getAddress } from "@ethersproject/address";
import { getTopPairs } from "../utils";
import { return200, return500 } from "../utils/response";

interface ReturnShape {
  [tokenIds: string]: {
    price: string;
    base_volume: string;
    quote_volume: string;
    liquidity: string;
    liquidity_CRO: string;
  };
}

const lastUpdated = Date.now();
let updating = false
const localPairs = {};
export default async function (req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    if (Object.keys(localPairs).length > 0 && (Date.now() < lastUpdated + 5 * 60 * 1000 || updating)) {
      return200(res, localPairs);
    }

    updating = true; // because single request take a long time
    const topPairs = await getTopPairs();

    const pairs = topPairs.reduce<ReturnShape>((accumulator, pair): ReturnShape => {
      const t0Id = getAddress(pair.token0.id);
      const t1Id = getAddress(pair.token1.id);

      accumulator[`${t0Id}_${t1Id}`] = {
        price: pair.price,
        base_volume: pair.volumeToken0,
        quote_volume: pair.volumeToken1,
        liquidity: pair.reserveUSD,
        liquidity_CRO: pair.reserveCRO,
      };

      return accumulator;
    }, {});
    updating = false;

    return200(res, { updated_at: new Date().getTime(), data: pairs });
  } catch (error) {
    return500(res, <Error>error);
  }
}
