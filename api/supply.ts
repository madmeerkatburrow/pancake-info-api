import { VercelRequest, VercelResponse } from "@vercel/node";
import { return200, return500 } from "../utils/response";
import { ethers, providers } from "ethers";
import erc20 from "../erc20";
import BigNumber from "bignumber.js";

const provider = new providers.StaticJsonRpcProvider("https://mmf.nebkas.ro");

const MMF_BURNED = [
  "0x61c20e2e1ded20856754321d585f7ad28e4d6b27",
  "0x000000000000000000000000000000000000dead",
  "0x0AF5144418a4FE0dB19712A31955513B82108287",
];
const MMO_BURNED = ["0x61c20e2e1ded20856754321d585f7ad28e4d6b27", "0x000000000000000000000000000000000000dead"];
const SVN_BURNED = ["0x0AF5144418a4FE0dB19712A31955513B82108287", "0xE25737b093626233877EC0777755c5c4081580be", "0x000000000000000000000000000000000000dead"];
const MSHARE_BURNED = ["0x0AF5144418a4FE0dB19712A31955513B82108287", "0xa51054bdf0910e3ce9b233e6b5bddc0931b2e2ed", "0x000000000000000000000000000000000000dead"];

const allTokens: { [token: string]: any } = {
  "MMF": {
    name: "MMF",
    address: "0x97749c9B61F878a880DfE312d2594AE07AEd7656",
    contract: new ethers.Contract("0x97749c9B61F878a880DfE312d2594AE07AEd7656", erc20, provider),
    burned: MMF_BURNED
  },
  "MMO": {
    name: "MMO",
    address: "0x50c0C5bda591bc7e89A342A3eD672FB59b3C46a7",
    contract: new ethers.Contract("0x50c0C5bda591bc7e89A342A3eD672FB59b3C46a7", erc20, provider),
    burned: MMO_BURNED
  },
  "SVN": {
    name: "SVN",
    address: "0x654bAc3eC77d6dB497892478f854cF6e8245DcA9",
    contract: new ethers.Contract("0x654bAc3eC77d6dB497892478f854cF6e8245DcA9", erc20, provider),
    burned: SVN_BURNED
  },
  "MSHARE": {
    name: "MSHARE",
    address: "0xf8b9facB7B4410F5703Eb29093302f2933D6E1Aa",
    contract: new ethers.Contract("0xf8b9facB7B4410F5703Eb29093302f2933D6E1Aa", erc20, provider),
    burned: MSHARE_BURNED
  }
}

const priceData: { [token: string]: any } = {
  MMF: {
    totalSupply: "",
    burned: "",
    lastUpdated: Date.now()
  },
  MMO: {
    totalSupply: "",
    burned: "",
    lastUpdated: Date.now()
  },
  SVN: {
    totalSupply: "",
    burned: "",
    lastUpdated: Date.now()
  },
  MSHARE: {
    totalSupply: "",
    burned: "",
    lastUpdated: Date.now()
  },
};

export default async function (req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    const token = (req.query.token as string) || "MMF";

    if (Date.now() < priceData[token].lastUpdated + 10 * 60 * 1000 && priceData[token].totalSupply) {
      return200(res, { totalSupply: priceData[token].totalSupply, burned: priceData[token].burned });
    }

    // Get total supply and substract the burned
    const totalSupply = new BigNumber((await allTokens[token].totalSupply()).toString());
    const response = await Promise.all(allTokens[token].burned.map((x: string) => allTokens[token].balanceOf(x)));
    let burned = new BigNumber(0);
    response.forEach((x) => {
      const temp = new BigNumber(x.toString());
      burned = burned.plus(temp);
    });

    priceData[token] = {
      totalSupply: totalSupply.minus(burned).toString(),
      burned: burned.toString(),
      lastUpdated: Date.now()
    };

    return200(res, {
      totalSupply: totalSupply.minus(burned).toString(),
      burned: burned.toString(),
    });
  } catch (error) {
    return500(res, <Error>error);
  }
}
