import React, { useState, useEffect } from "react";
import Web3 from "web3";
import charityLotteryABI from "./Lottery.json";

function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [manager, setManager] = useState("");
  const [carPlayers, setCarPlayers] = useState([]);
  const [phonePlayers, setPhonePlayers] = useState([]);
  const [computerPlayers, setComputerPlayers] = useState([]);
  const [currentAccount, setCurrentAccount] = useState("");
  const [lotteryOpen, setLotteryOpen] = useState(false);
  const [amIWinnerResult, setAmIWinnerResult] = useState(null);
  const [isManager, setIsManager] = useState(false);
  const [contractBalance, setContractBalance] = useState("");
  const [newOwner, setNewOwner] = useState(""); // Νέος ιδιοκτήτης

  useEffect(() => {
    async function init() {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.enable();
        setWeb3(web3Instance);
      } else if (window.web3) {
        const web3Instance = new Web3(window.web3.currentProvider);
        setWeb3(web3Instance);
      } else {
        console.log("No web3 provider detected");
      }
    }
    init();
  }, []);

  useEffect(() => {
    async function loadBlockchainData() {
      if (web3) {
        const accounts = await web3.eth.getAccounts();
        setAccounts(accounts);
        setCurrentAccount(accounts[0]);

        const contractInstance = new web3.eth.Contract(
          charityLotteryABI,
          "0x65bcaEC73D27DAB81fF749B0A82a79CA3d98df38"
        );
        setContract(contractInstance);

        const manager = await contractInstance.methods.manager().call();
        setManager(manager);
        setIsManager(manager.toLowerCase() === accounts[0].toLowerCase());

        const updatePlayers = async () => {
          const carPlayers = await contractInstance.methods
            .getCarLotteryPlayers()
            .call();
          const phonePlayers = await contractInstance.methods
            .getPhoneLotteryPlayers()
            .call();
          const computerPlayers = await contractInstance.methods
            .getComputerLotteryPlayers()
            .call();
          setCarPlayers(carPlayers);
          setPhonePlayers(phonePlayers);
          setComputerPlayers(computerPlayers);
        };

        updatePlayers();

        const updateContractBalance = async () => {
          const balance = await web3.eth.getBalance(contractInstance.options.address);
          setContractBalance(web3.utils.fromWei(balance, "ether"));
        };

        updateContractBalance();

        const intervalId = setInterval(() => {
          updatePlayers();
          contractInstance.methods.lotteryOpen().call().then(setLotteryOpen);
          updateContractBalance();
        }, 3000);

        return () => clearInterval(intervalId);
      }
    }
    loadBlockchainData();
  }, [web3]);

  const enterLottery = async (type) => {
    if (contract) {
      try {
        let methodName;
        if (type === "car") methodName = "enterCarLottery";
        else if (type === "phone") methodName = "enterPhoneLottery";
        else if (type === "computer") methodName = "enterComputerLottery";
        else return;

        await contract.methods[methodName]().send({
          from: accounts[0],
          value: web3.utils.toWei("0.01", "ether"),
        });
        console.log(`Entered ${type} lottery successfully`);
      } catch (error) {
        console.error(`Error entering ${type} lottery:`, error);
      }
    }
  };



  const amIWinner = async () => {
    if (contract) {
      try {
        const result = await contract.methods.amIWinner().call({ from: accounts[0] });
        console.log("Am I Winner successful");
        console.log("Winner: ", result[0] ? "Yes" : "No");
        console.log("Category: ", result[1]);
        setAmIWinnerResult(result);
      } catch (error) {
        console.error("Error checking if winner:", error);
      }
    }
  };

  const withdraw = async () => {
    if (contract) {
      try {
        await contract.methods.withdraw().send({
          from: accounts[0]
        });
        console.log("Withdraw successful");
      } catch (error) {
        console.error("Error withdrawing:", error);
      }
    }
  };

  const startNewLotteryCycle = async () => {
    if (contract) {
      try {
        await contract.methods.startNewLotteryCycle().send({
          from: accounts[0]
        });
        console.log("New lottery cycle started successfully");
      } catch (error) {
        console.error("Error starting new lottery cycle:", error);
      }
    }
  };

  const transferOwnership = async () => {
    if (contract && newOwner) {
      try {
        await contract.methods.transferOwnership(newOwner).send({
          from: accounts[0]
        });
        console.log("Ownership transferred successfully");
      } catch (error) {
        console.error("Error transferring ownership:", error);
      }
    }
  };

  const selectCarWinner = async () => {
    if (contract) {
      try {
        await contract.methods.selectCarWinner().send({ from: accounts[0] });
        console.log("Car winner selected successfully");
      } catch (error) {
        console.error("Error selecting car winner:", error);
      }
    }
  };

  const selectPhoneWinner = async () => {
    if (contract) {
      try {
        await contract.methods.selectPhoneWinner().send({ from: accounts[0] });
        console.log("Phone winner selected successfully");
      } catch (error) {
        console.error("Error selecting phone winner:", error);
      }
    }
  };

  const selectComputerWinner = async () => {
    if (contract) {
      try {
        await contract.methods.selectComputerWinner().send({ from: accounts[0] });
        console.log("Computer winner selected successfully");
      } catch (error) {
        console.error("Error selecting computer winner:", error);
      }
    }
  };

  return (
    <div>
      <h1>Charity Lottery</h1>
      <p>Current Address: {currentAccount}</p>
      <p>Manager Address: {manager}</p>
      <p>Contract Balance: {contractBalance} ETH</p>
      <div>
        <h2>Enter Lottery</h2>
        <button onClick={() => enterLottery("car")} disabled={!lotteryOpen || isManager}>
  Enter Car Lottery
</button>
<button onClick={() => enterLottery("phone")} disabled={!lotteryOpen || isManager}>
  Enter Phone Lottery
</button>
<button onClick={() => enterLottery("computer")} disabled={!lotteryOpen || isManager}>
  Enter Computer Lottery
</button>
      </div>
      <div>
        <h2>Players</h2>
        <h3>Car Lottery Players:</h3>
        <ul>
          {carPlayers.map((player, index) => (
            <li key={index}>{player}</li>
          ))}
        </ul>
        <h3>Phone Lottery Players:</h3>
        <ul>
          {phonePlayers.map((player, index) => (
            <li key={index}>{player}</li>
          ))}
        </ul>
        <h3>Computer Lottery Players:</h3>
        <ul>
          {computerPlayers.map((player, index) => (
            <li key={index}>{player}</li>
          ))}
        </ul>
      </div>
      <div>
        
        <button onClick={amIWinner} disabled={!lotteryOpen || isManager}>
          Am I Winner
        </button>
        <button onClick={withdraw} disabled={!lotteryOpen || !isManager}>
  Withdraw
</button>
        {isManager && (
          <button onClick={startNewLotteryCycle}>
            Start New Lottery Cycle
          </button>
        )}
        {isManager && (
          <div>
            <input
              type="text"
              placeholder="New Owner Address"
              value={newOwner}
              onChange={(e) => setNewOwner(e.target.value)}
            />
            <button onClick={transferOwnership}>Transfer Ownership</button>
          </div>
        )}
      </div>
      <div>
        <h2>Am I Winner</h2>
        {amIWinnerResult && (
          <p>
            Winner: {amIWinnerResult[0] ? "Yes" : "No"}<br />
            Category: {amIWinnerResult[1]}
          </p>
        )}
      </div>
      <div>
        <h2>Select Winners</h2>
        <button onClick={selectCarWinner} disabled={!isManager}>
          Select Car Winner
        </button>
        <button onClick={selectPhoneWinner} disabled={!isManager}>
          Select Phone Winner
        </button>
        <button onClick={selectComputerWinner} disabled={!isManager}>
          Select Computer Winner
        </button>
      </div>
    </div>
  );
}

export default App;
