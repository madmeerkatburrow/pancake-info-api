import { VercelRequest, VercelResponse } from "@vercel/node";
import { return200, return500 } from "../utils/response";
import { ethers, providers } from 'ethers';
import erc20 from '../erc20';
import BigNumber from 'bignumber.js'

const provider = new providers.StaticJsonRpcProvider('https://mmf.nebkas.ro');

const MMF_ADDRESS = "0x97749c9B61F878a880DfE312d2594AE07AEd7656";
const mmfContract = new ethers.Contract(MMF_ADDRESS, erc20, provider);
const MMF_BURNED = ["0x61c20e2e1ded20856754321d585f7ad28e4d6b27", "0x000000000000000000000000000000000000dead", "0x0AF5144418a4FE0dB19712A31955513B82108287"];

let lastUpdated = Date.now()
const data: {[token: string]: any} = {
  "MMF": {
    totalSupply: "",
    burned: ""
  }
}


export default async function (req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    if (Date.now() < lastUpdated + 10 * 60 * 1000 && data["MMF"].totalSupply) {
      return200(res, {totalSupply: data["MMF"].totalSupply, burned: data["MMF"].burned})
    }

    const token = req.query.token as string || "MMF";

    // Get total supply and substract the burned
    const totalSupply = new BigNumber((await mmfContract.totalSupply()).toString());
    const response = await Promise.all(MMF_BURNED.map(x => mmfContract.balanceOf(x)));
    let burned = new BigNumber(0);
    response.forEach(x => {
      const temp = new BigNumber(x.toString());
      burned = burned.plus(temp)
    })

    data[token] = {
      totalSupply: totalSupply.minus(burned).toString(),
      burned: burned.toString()
    }

    lastUpdated = Date.now()

    return200(res, { totalSupply: totalSupply.minus(burned).toString(), burned: burned.toString() });
  } catch (error) {
    return500(res, <Error>error);
  }
}