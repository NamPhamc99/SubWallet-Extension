// Copyright 2019-2022 @polkadot/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApiPromise, WsProvider } from '@polkadot/api';
// import networks from "@polkadot/extension-koni-base/api/endpoints";
// import unique_types from "@polkadot/extension-koni-base/api/unique_nft/runtime_types";
import { NetWorkInfo } from '@polkadot/extension-base/background/KoniTypes';

import { getChainMetadata } from './rpc_api';

export const wsProvider = async ({ provider }: NetWorkInfo, type?: any): Promise<ApiPromise> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const wsProvider = new WsProvider(provider);

  return ApiPromise.create({ provider: wsProvider, types: type });
};

// Return an array of apis with the order like the input
export const initWsNetworkMap = (networkMap: Record<string, NetWorkInfo>) => {
  if (Object.keys(networkMap).length <= 0) {
    console.log('Must pass at least 1 chainId.');

    return null;
  }

  const wsMap: Record<string, Promise<ApiPromise>> = {};

  Object.keys(networkMap).forEach((k) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const networkInfo = networkMap[k];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    if (!networkInfo.genesisHash || networkInfo.genesisHash.toLowerCase() === 'unknown') {
      return;
    }

    wsMap[k] = wsProvider(networkInfo);
  });

  return wsMap;
};

// Return an array of apis with the order like the input
export const connectChains = async (targetChains: Array<any>): Promise<any[] | undefined> => {
  if (targetChains.length <= 0) {
    console.log('Must pass at least 1 chainId.');

    return undefined;
  }

  const apiPromises: any[] = [];

  targetChains.map((item) => {
    const chainMetadata = getChainMetadata({ chainId: item.chainId, paraId: item.paraId });

    if (chainMetadata && chainMetadata.rpcs) {
      const apiPromise = wsProvider({ provider: chainMetadata.rpcs });

      apiPromises.push(apiPromise);
    } else apiPromises.push(null);
  });

  return await Promise.all(apiPromises);
};
