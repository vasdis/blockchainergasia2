import React, { useState, useEffect } from "react";
import Web3 from "web3";

function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [manager, setManager] = useState("");
  const [players, setPlayers] = useState([]);

  const lotteryContractSource = `
    pragma solidity ^0.8.0;

    contract Lottery {
        address public manager; // Ο ιδιοκτήτη
        address[] public players; // Όσοι έχουν αγοράσει λαχνό

        event PlayerEntered(address player); // Μόλις κάποιος αγοράσει λαχνό
        event WinnerPicked(address winner); // Μόλις κάποιος κληρωθεί

        constructor() {
            manager = msg.sender;
        }

        // Αγορά λαχνού από τον msg.sender
        function enter() public payable {
            require(msg.value >= .01 ether);

            players.push(msg.sender); // καταχώρηση του αγοραστή στον πίνακα players
            emit PlayerEntered(msg.sender);
        }

        // Πολύ απλή γεννήτρια τυχαίων
        function random() private view returns (uint) {
            return uint(block.timestamp);
        }

        // Κλήρωση
        function pickWinner() public {
            require(msg.sender == manager);
            uint index = random() % players.length; // Τυχαία θέση στον players
            // Στείλε όλα τα λεφτά στη διεύθυνση της θέσης
            payable(players[index]).transfer(address(this).balance);
            emit WinnerPicked(players[index]);
            players = new address[](0); // Μηδένισε τον πίνακα players
        }

        function getPlayers() public view returns (address[] memory) {
            return players;
        }
    }
  `;

  useEffect(() => {
    async function init() {
      // Σύνδεση με τον πάροχο web3
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
        // Φόρτωση των διευθύνσεων λογαριασμών
        const accounts = await web3.eth.getAccounts();
        setAccounts(accounts);

        // Δημιουργία του συμβολαίου
        const contract = new web3.eth.Contract(lotteryContractSource);
        setContract(contract);

        // Φόρτωση του ιδιοκτήτη και των παικτών
        const manager = await contract.methods.manager().call();
        const players = await contract.methods.getPlayers().call();
        setManager(manager);
        setPlayers(players);
      }
    }
    loadBlockchainData();
  }, [web3]);

  const enterLottery = async () => {
    if (contract) {
      try {
        await contract.methods.enter().send({ from: accounts[0], value: web3.utils.toWei('0.01', 'ether') });
        console.log("Entered lottery successfully");
      } catch (error) {
        console.error("Error entering lottery:", error);
      }
    }
  };

  return (
    <div>
      <h1>Charity Lottery</h1>
      <p>Current Address: {accounts[0]}</p>
      <p>Manager Address: {manager}</p>
      <div>
        <h2>Enter Lottery</h2>
        <button onClick={enterLottery}>Enter</button>
      </div>
      <div>
        <h2>Players</h2>
        <ul>
          {players.map((player, index) => (
            <li key={index}>{player}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;




