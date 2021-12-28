import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client/core";
import fetch from "cross-fetch";

export const client = new ApolloClient({
  link: new HttpLink({
    fetch,
    uri: "https://graph.mm.finance/subgraphs/name/madmeerkat-finance/exchange",
  }),
  cache: new InMemoryCache(),
});
