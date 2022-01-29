// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import { TransactionHistoryItemType } from '@polkadot/extension-base/background/KoniTypes';
import { ThemeProps } from '@polkadot/extension-koni-ui/types';
import { getScanExplorerTransactionHistoryUrl, isSupportScanExplorer } from '@polkadot/extension-koni-ui/util';
import TransactionHistoryEmptyList from './EmptyList';
import TransactionHistoryItem from './TransactionHistoryItem';
import {ChainRegistry} from "@polkadot/extension-base/background/KoniTypes";
import {getTransactionHistoryByMultiNetworks} from "@polkadot/extension-koni-ui/messaging";

interface Props extends ThemeProps {
  className?: string;
  networkKeys: string[];
  address: string;
  registryMap: Record<string, ChainRegistry>;
}

interface ContentProp {
  className?: string;
  registryMap: Record<string, ChainRegistry>;
  items: TransactionHistoryItemType[];
}

function getReadyNetwork(registryMap: Record<string, ChainRegistry>): string[] {
  const result: string[]  = [];

  for (let networkKey in registryMap) {
    if (!registryMap.hasOwnProperty(networkKey)) {
      continue;
    }

    if (registryMap[networkKey]) {
      result.push(networkKey);
    }
  }

  return result;
}

function Wrapper ({ className, networkKeys, address, registryMap}: Props): React.ReactElement<Props> {
  const [items, setItems] = useState<TransactionHistoryItemType[]>([]);

  useEffect(() => {
    let isSync = true;

    (async () => {
      getTransactionHistoryByMultiNetworks(address, networkKeys, (items) => {
        if (isSync) {
          setItems(items)
        }
      }).catch(e => console.log('Error when get Transaction History', e));
    })();

    return () => {
      isSync = false;
      setItems([]);
    };
  }, [networkKeys, address]);

  const readyNetworks = getReadyNetwork(registryMap);
  const readyItems = items.filter(i => readyNetworks.includes(i.networkKey));

  if (!readyItems.length) {
    return (<TransactionHistoryEmptyList/>);
  }

  return (<TransactionHistory items={readyItems} registryMap={registryMap} className={className}/>)
}

function TransactionHistory ({ className, items, registryMap }: ContentProp): React.ReactElement<ContentProp> {
  const renderChainBalanceItem = (item: TransactionHistoryItemType, registryMap: Record<string, ChainRegistry>) => {
    const { networkKey } = item;

    const { extrinsicHash } = item;

    if (isSupportScanExplorer(networkKey)) {
      return (
        <a
          className={'transaction-item-wrapper'}
          href={getScanExplorerTransactionHistoryUrl(networkKey, extrinsicHash)}
          key={extrinsicHash}
          rel='noreferrer'
          target={'_blank'}
        >
          <TransactionHistoryItem
            item={item}
            registry={registryMap[networkKey]}
          />
        </a>
      );
    }

    return (
      <div key={extrinsicHash}>
        <TransactionHistoryItem
          isSupportSubscan={false}
          item={item}
          registry={registryMap[networkKey]}
        />
      </div>
    );
  };

  return (
    <div className={`transaction-history ${className || ''}`}>
      {items.map((item) => renderChainBalanceItem(item, registryMap))}
    </div>
  );
}

export default styled(Wrapper)(({ theme }: Props) => `
  height: 100%;
  overflow-y: auto;
`);
