import logo from "./logo.svg";
import "./App.css";
import { useWeb3React } from "@web3-react/core";
import Web3 from "web3";
import { useEffect, useState } from "react";
import ERC20 from './ERC20.json';
import MASTERCHEF from './MASTER.json';
import { injected, walletConnectConnector } from './connector.js';
import { createClient } from 'urql';
import BigNumber from 'bignumber.js';
import { Multicall } from 'ethereum-multicall';
import { Button, Table } from '@material-ui/core';
import moment from 'moment';

const APIURL = "https://api.thegraph.com/subgraphs/name/sotatek-thunguyen2/masterchefcontract";

const query = `
{
  historyEntities(where: {address: "0x6B874665BF650aDFa4DAa52e7ba847F18C927290"}) {
    id
    address
    amount
    time
    type
  }
}

`
const client = createClient({
  url: APIURL
})

function App() {
  const { account, activate, library } = useWeb3React();
  const [wethBalance, setwethBlance] = useState(0);
  const [deposited, setDeposited] = useState(0);
  const [pendingReward, setPendingReward] = useState(0);
  const [totalStake, setTotalStake] = useState(0);
  const [history, setHistory] = useState([]);
  const WethAddress = '0xc778417E063141139Fce010982780140Aa0cD5Ab';
  const masterChefAddress = '0x9da687e88b0A807e57f1913bCD31D56c49C872c2'
  console.log(library);
  const connectInjectedConnector = () => {
    activate(injected);
  };

  const connectWalletConnectConnector = () => {
    activate(walletConnectConnector, undefined, true).catch(e => console.log('ee', e));
  };

  const getInfo = async () => {
    try {
      const web3 = new Web3(library.provider);
      const multicall = new Multicall({ web3Instance: web3, tryAggregate: true });
      const contractCallContext = [
        {
          reference: "weth",
          contractAddress: WethAddress,
          abi: ERC20,
          calls: [
            {
              reference: "balance",
              methodName: "balanceOf",
              methodParameters: [account],
            },
            {
              reference: "totalStake",
              methodName: "totalSupply",
              methodParameters: [],
            },
          ],
        },
        {
          reference: "masterChef",
          contractAddress: masterChefAddress,
          abi: MASTERCHEF,
          calls: [
            {
              reference: "userInfo",
              methodName: "userInfo",
              methodParameters: [account],
            },
            {
              reference: "pendingDD2",
              methodName: "pendingDD2",
              methodParameters: [account],
            },
          ],
        },
      ];
      const result = await multicall.call(contractCallContext);
      console.log("result.results", result);
      setwethBlance(
        web3.utils.fromWei(
          new BigNumber(
            result.results.weth.callsReturnContext[0].returnValues[0].hex,
            16
          ).toFixed()
        )
      );
      setTotalStake(
        web3.utils.fromWei(
          new BigNumber(
            result.results.weth.callsReturnContext[1].returnValues[0].hex,
            16
          ).toFixed()
        )
      );
      setDeposited(
        web3.utils.fromWei(
          new BigNumber(
            result.results.masterChef.callsReturnContext[0].returnValues[0].hex,
            16
          ).toFixed()
        )
      );
      setPendingReward(
        web3.utils.fromWei(
          new BigNumber(
            result.results.masterChef.callsReturnContext[1].returnValues[0].hex,
            16
          ).toFixed()
        )
      )
      console.log('result:', result);

    } catch (error) {
      console.log('error:', error)
    }
  }

  useEffect(() => {
    if (account) {

      fetchData()
    }
  }, [account])
  const fetchData = async () => {
    const response = await client.query(query).toPromise();
    console.log('response:', response)
    setHistory(response.data.historyEntities);
    console.log(history)
  }
  useEffect(() => {
    if (account) {
      getInfo();
    }

  }, [account, library])

  return (

    <div className="App">
      <h1>Web3 React</h1>
      {
        account ? <>
          <p>Wallet address: {account}</p>
          <p>Balance : {wethBalance} WETH</p>
          <p>Total Earn : { pendingReward} DD2</p>
          <p>Your stake : {deposited} WETH</p>
          <p>Total Stake: {totalStake}</p>
          <Table striped bordered hover>
            <thead>
              <th>Action</th>
              <th>Amount</th>
              <th>Time</th>
            </thead>
            { history?.map((item) => (
              <tr>
                <td>{item.type}</td>
                <td>
                  {new BigNumber(item.amount)
                    .dividedBy(10 ** 18)
                    .toFormat()}
                </td>
                <td>{moment.unix(item.time).format('HH:MM  MM/DD/YYYY')}</td>
              </tr>
            ))}
          </Table>
        </> : <>
          <Button style={{ marginRight: 10 }} variant="contained" color="primary" onClick={connectInjectedConnector}>Connect Metamask </Button>
          <Button variant="contained" color="primary" onClick={connectWalletConnectConnector}>Connect WalletConnect </Button></>
      }
    </div>

  );
}

export default App;