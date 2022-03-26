import logo from "./logo.svg";
import "./App.css";
import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { useWeb3React } from "@web3-react/core";
import Web3 from "web3";
import { useEffect, useState } from "react";
import ERC20 from './ERC20.json';
import {injected, walletConnectConnector} from './connector.js';
import { createClient } from 'urql';
//import { fetchData } from "./subgraph";

const APIURL = "https://api.thegraph.com/subgraphs/name/sotatek-thunguyen2/demo";

const query = `
{
  depositEntities(first: 5, where: {address: "0x6B874665BF650aDFa4DAa52e7ba847F18C927290"}) {
    id
    address
    amount
    time
  }
  withdrawEntities(first: 5, where: {address: "0x6B874665BF650aDFa4DAa52e7ba847F18C927290"}) {
    id
    address
    amount
    time
  }
}
`
const client = createClient({
  url: APIURL
})


function App() {
  const { account, chainId, connector, activate, library } = useWeb3React();
  console.log('CHAINID:', chainId);
  const [balance, setBlance] = useState(0);

  console.log(library);
  const connectInjectedConnector = () => {
    activate(injected);
  };

  const connectWalletConnectConnector = () => {
    activate(walletConnectConnector, undefined, true).catch(e => console.log('ee', e));
  };

  const withdraw = async () => {
    if (account && chainId && library) {
      const web3 = new Web3(library.provider);
    } 
  }

  const getBalance = async () => {
    const web3 = new Web3(library.provider);
    console.log(library.provider);
    const wethContract = new web3.eth.Contract(ERC20, '0xc778417e063141139fce010982780140aa0cd5ab');
    console.log(wethContract);
    const balanceAccount = await wethContract.methods.balanceOf(account).call();
    console.log(balanceAccount);
    setBlance(web3.utils.fromWei(balanceAccount));
  }

  const getStaticInfo = async () => {
    await getBalance();
  };

  const deposit = async () => {
    const web3 = new Web3(library.provider);
    console.log(library.provider);
    const wethContract = new web3.eth.Contract(ERC20, '0xc778417e063141139fce010982780140aa0cd5ab');
    await wethContract.methods.deposit().send({ value: web3.utils.toWei('0.1'), from: account });
    console.log('DEPOSIT SUCCESS');
  };

  const [setData] = useState([]);
  const fetchData = async () => {
    const response = await client.query(query).toPromise();
    console.log('response:', response)
    setData(response.data);
  }

  useEffect(() => {
    if(account){
      getStaticInfo();
      fetchData()
    }
  }, [account]);
  return (
    <div className="App">
      <div style={{ marginTop: "4rem" }}>
        {
          account ? 
          <> <h1>Account: {account} </h1> 
              <h2>Balance: {balance}</h2>
              <button onClick={deposit}>Deposit</button>
          </> :
          <> <button onClick={connectInjectedConnector}>Connect Metamask</button> 
          <br/>
            <button style={{ marginTop: '3rem' }} onClick={connectWalletConnectConnector}>Connect WalletConnect</button> 
          </>

        }
      </div>
    </div>
  );
}

export default App;
