import Web3 from "web3";
import supplyChainArtifact from "../../build/contracts/SupplyChain.json";

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function () {
    const {
      web3
    } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = supplyChainArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(
        supplyChainArtifact.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  addSellerFunc: async function () {
    const {
      addSeller
    } = this.meta.methods;
    const sellerID = document.getElementById("addSeller_sellerID").value;
    await addSeller(sellerID);
    document.getElementById("addSeller_status").innerHTML = "Seller with address " + sellerID + " has been added.";
  },

  printItemFunc: async function () {
    const {
      printItem
    } = this.meta.methods;
    const itemUPC = Number(document.getElementById("print_itemUPC").value);
    const itemSellername = document.getElementById("print_itemSellername").value;
    const itemProductNotes = document.getElementById("print_itemProductNotes").value;
    const itemProductPrice = web3.toWei(Number(document.getElementById("print_itemProductPrice").value), "ether");
    await printItem(itemUPC, itemSellername, itemProductNotes, itemProductPrice).send({
      from: this.account
    });
    document.getElementById("print_status").innerHTML = "New item printed by " + this.account + " has UPC " + itemUPC + ".";
  },

  purchaseItemFunc: async function () {
    const {
      purchaseItem
    } = this.meta.methods;
    const itemUPC = Number(document.getElementById("purchase_itemUPC").value);
    const balance = web3.toWei(1, "ether");
    await purchaseItem(itemUPC).send({
      from: this.account,
      value: balance,
      gasPrice: 0
    });
    document.getElementById("purchase_status").innerHTML = "Item purchased by " + this.account + " having UPC " + itemUPC + ".";
  },

  shipItemFunc: async function () {
    const {
      shipItem
    } = this.meta.methods;
    const itemUPC = Number(document.getElementById("ship_itemUPC").value);
    const itemTransporterID = document.getElementById("ship_itemTransporterID").value;
    await shipItem(itemUPC, itemTransporterID).send({
      from: this.account
    });
    document.getElementById("ship_status").innerHTML = "Item having UPC" + itemUPC + " shipped by " + this.account + " from transporter " + itemTransporterID + ".";
  },

  receiveItemFunc: async function () {
    const {
      receiveItem
    } = this.meta.methods;
    const itemUPC = Number(document.getElementById("receive_itemUPC").value);
    await receiveItem(itemUPC).send({
      from: this.account
    });
    document.getElementById("receive_status").innerHTML = "Item having UPC" + itemUPC + " received by " + this.account + ".";
  },

  fetchItemPrintDetailsFunc: async function () {
    const {
      fetchItemPrintDetails
    } = this.meta.methods;
    const itemUPC = Number(document.getElementById("printDetails_itemUPC").value);
    const itemDetails = await fetchItemPrintDetails(itemUPC).call();
    document.getElementById("printDetails_status").innerHTML = "UPC: " + Number(itemDetails[0]) + "<br>Seller ID: " + itemDetails[1] + "<br>Seller Name: " + itemDetails[2] + "<br>Product Notes: " + itemDetails[3] + "<br>Product Price: " + Number(itemDetails[4]);
  },

  fetchItemChainFunc: async function () {
    const {
      fetchItemBufferTwo
    } = this.meta.methods;
    const itemUPC = Number(document.getElementById("chain_itemUPC").value);
    const itemDetails = await fetchItemBufferTwo(itemUPC).call();
    let state = Number(itemDetails[5]);
    state = (state === 0) ? "Printed" : (state === 1) ? "Purchased" : (state === 2) ? "Shipped" : (state === 3) ? "Received" : null;
    document.getElementById("chainDetails_status").innerHTML = "SKU: " + Number(itemDetails[0]) + "<br>UPC: " + Number(itemDetails[1]) + "<br>Product ID: " + Number(itemDetails[2]) + "<br>Product Notes: " + itemDetails[3] + "<br>Product Price: " + Number(itemDetails[4]) + "<br>State: " + state + "<br>Transporter ID: " + itemDetails[6] + "<br>Consumer ID: " + itemDetails[7];
  }

};

window.App = App;

window.addEventListener("load", async function () {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    await window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live", );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"), );
  }

  App.start();
});