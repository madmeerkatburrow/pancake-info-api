import { VercelRequest, VercelResponse } from "@vercel/node";
import { return200, return500 } from "../utils/response";
import { ethers, providers } from "ethers";
import erc20 from "../erc20";
import BigNumber from "bignumber.js";

const provider = new providers.StaticJsonRpcProvider("https://mmf.nebkas.ro");
const providerPoly = new providers.StaticJsonRpcProvider("https://polygon-rpc.com");

const MMF_BURNED = [
  "0x61c20e2e1ded20856754321d585f7ad28e4d6b27",
  "0x000000000000000000000000000000000000dead",
  "0x0AF5144418a4FE0dB19712A31955513B82108287",
];
const MMO_BURNED = [
  "0x61c20e2e1ded20856754321d585f7ad28e4d6b27",
  "0x000000000000000000000000000000000000dead",
];
const SVN_BURNED = [
  "0x0AF5144418a4FE0dB19712A31955513B82108287",
  "0xE25737b093626233877EC0777755c5c4081580be",
  "0x000000000000000000000000000000000000dead",
];
const MSHARE_BURNED = [
  "0x0AF5144418a4FE0dB19712A31955513B82108287",
  "0xa51054bdf0910e3ce9b233e6b5bddc0931b2e2ed",
  "0x000000000000000000000000000000000000dead",
];
const METF_BURNED = [
  "0xe25737b093626233877ec0777755c5c4081580be",
  "0x000000000000000000000000000000000000dead",
];
const MAD_BURNED = [
  "0x5AF4DC6fbB8489aB14DdE6d901dE3FBdC4d078f6",
  "0x212331e1435A8df230715dB4C02B2a3A0abF8c61",
  "0xe551719c883d1e2e956d88b02b522bc508c0020c"
]
const pMMF_BURNED = [
  "0x61c20e2e1ded20856754321d585f7ad28e4d6b27",
  "0x0f7Efb2e96B9681950f96D3D18ce0BF68d60fD7e",
  "0x000000000000000000000000000000000000dEaD"
];

const allTokens: { [token: string]: any } = {
  MMF: {
    name: "MMF",
    address: "0x97749c9B61F878a880DfE312d2594AE07AEd7656",
    contract: new ethers.Contract("0x97749c9B61F878a880DfE312d2594AE07AEd7656", erc20, provider),
    burned: MMF_BURNED,
    decimals: new BigNumber(10).pow(18),
  },
  MMO: {
    name: "MMO",
    address: "0x50c0C5bda591bc7e89A342A3eD672FB59b3C46a7",
    contract: new ethers.Contract("0x50c0C5bda591bc7e89A342A3eD672FB59b3C46a7", erc20, provider),
    burned: MMO_BURNED,
    decimals: new BigNumber(10).pow(18),
  },
  SVN: {
    name: "SVN",
    address: "0x654bAc3eC77d6dB497892478f854cF6e8245DcA9",
    contract: new ethers.Contract("0x654bAc3eC77d6dB497892478f854cF6e8245DcA9", erc20, provider),
    burned: SVN_BURNED,
    decimals: new BigNumber(10).pow(18),
  },
  MSHARE: {
    name: "MSHARE",
    address: "0xf8b9facB7B4410F5703Eb29093302f2933D6E1Aa",
    contract: new ethers.Contract("0xf8b9facB7B4410F5703Eb29093302f2933D6E1Aa", erc20, provider),
    burned: MSHARE_BURNED,
    decimals: new BigNumber(10).pow(18),
  },
  METF: {
    name: "METF",
    address: "0xB8Df27c687c6af9aFE845A2aFAD2D01e199f4878",
    contract: new ethers.Contract("0xB8Df27c687c6af9aFE845A2aFAD2D01e199f4878", erc20, provider),
    burned: METF_BURNED,
    decimals: new BigNumber(10).pow(18),
  },
  MAD: {
    name: "MAD",
    address: "0x212331e1435A8df230715dB4C02B2a3A0abF8c61",
    contract: new ethers.Contract("0x212331e1435A8df230715dB4C02B2a3A0abF8c61", erc20, provider),
    burned: MAD_BURNED,
    decimals: new BigNumber(10).pow(18),
  },
  // Polygon
  pMMF: {
    name: "MMF",
    address: "0x22a31bD4cB694433B6de19e0aCC2899E553e9481",
    contract: new ethers.Contract("0x22a31bD4cB694433B6de19e0aCC2899E553e9481", erc20, providerPoly),
    burned: pMMF_BURNED,
    decimals: new BigNumber(10).pow(18),
  },
};

const priceData: { [token: string]: any } = {
  MMF: {
    totalSupply: "",
    burned: "",
    lastUpdated: Date.now(),
    network: 'cronos'
  },
  MMO: {
    totalSupply: "",
    burned: "",
    lastUpdated: Date.now(),
    network: 'cronos'
  },
  SVN: {
    totalSupply: "",
    burned: "",
    lastUpdated: Date.now(),
    network: 'cronos'
  },
  MSHARE: {
    totalSupply: "",
    burned: "",
    lastUpdated: Date.now(),
    network: 'cronos'
  },
  METF: {
    totalSupply: "",
    burned: "",
    lastUpdated: Date.now(),
    network: 'cronos'
  },
  MAD: {
    totalSupply: "",
    burned: "",
    lastUpdated: Date.now(),
    network: 'cronos'
  },
  pMMF: {
    totalSupply: "",
    burned: "",
    lastUpdated: Date.now(),
    network: 'polygon'
  },
};

export default async function (req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    const token = (req.query.token as string) || "MMF";

    if (Date.now() < priceData[token].lastUpdated + 3 * 60 * 1000 && priceData[token].totalSupply) {
      return200(res, priceData[token]);
    }

    if (allTokens[token] === undefined) {
      throw new Error("unknown token")
    }

    // Get total supply and substract the burned
    const totalSupply = new BigNumber((await allTokens[token].contract.totalSupply()).toString());
    let burned = new BigNumber(0);
    const allBurned = await Promise.all(
      allTokens[token].burned.map((x: string) => allTokens[token].contract.balanceOf(x))
    );
    allBurned.forEach((x) => {
      const temp = new BigNumber(x.toString());
      burned = burned.plus(temp);
    });

    const value = {
      totalSupply: totalSupply.minus(burned).div(allTokens[token].decimals).toString(),
      burned: burned.div(allTokens[token].decimals).toString(),
      lastUpdated: Date.now(),
      network: priceData[token].network
    };

    priceData[token] = {
      ...value,
    };

    return200(res, value);
  } catch (error) {
    return500(res, <Error>error);
  }
}
