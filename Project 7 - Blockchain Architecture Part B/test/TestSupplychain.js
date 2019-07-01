// This script is designed to test the solidity smart contract - SuppyChain.sol -- and the various functions within
// Declare a variable and assign the compiled smart contract artifact
const SupplyChain = artifacts.require("SupplyChain");

var accounts;
var owner;

contract('SupplyChain', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can print an item', async () => {
    let instance = await SupplyChain.deployed();
    const upc = 1;
    const sellerID = accounts[1];
    const sellerName = 'kartoon';
    const productNotes = 'just a kartoon';
    const productPrice = web3.utils.toWei(".01", "ether");
    await instance.addSeller(sellerID);
    await instance.printItem(upc, sellerName, productNotes, productPrice, {
        from: sellerID
    });
    const returnedVal = await instance.fetchItemPrintDetails.call(upc);
    assert.equal(
        (Number(returnedVal[0]), returnedVal[1], returnedVal[2], returnedVal[3], returnedVal[4]),
        (upc, sellerID, sellerName, productNotes, productPrice)
    );
});

it('lets user1 get the funds after purchase', async () => {
    let instance = await SupplyChain.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    const upc = 2;
    const sellerID = user1;
    const sellerName = 'kartoon';
    const productNotes = 'just a kartoon';
    const productPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.printItem(upc, sellerName, productNotes, productPrice, {
        from: sellerID
    });
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.purchaseItem(upc, {
        from: user2,
        value: balance,
        gasPrice: 0
    });
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(productPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy an item', async () => {
    let instance = await SupplyChain.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    const upc = 3;
    const sellerID = user1;
    const sellerName = 'kartoon';
    const productNotes = 'just a kartoon';
    const productPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.printItem(upc, sellerName, productNotes, productPrice, {
        from: sellerID
    });
    await instance.purchaseItem(upc, {
        from: user2,
        value: balance,
        gasPrice: 0
    });
    const receivedVal = await instance.fetchItemBufferTwo(upc);
    assert.equal(receivedVal[7], user2);
});

it('lets user2 buy an item and decreases its balance in ether', async () => {
    let instance = await SupplyChain.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    const upc = 4;
    const sellerID = user1;
    const sellerName = 'kartoon';
    const productNotes = 'just a kartoon';
    const productPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.printItem(upc, sellerName, productNotes, productPrice, {
        from: sellerID
    });
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.purchaseItem(upc, {
        from: user2,
        value: balance,
        gasPrice: 0
    });
    const balanceAfterUser2BuysItem = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysItem);
    assert.equal(value, productPrice);
});

it('lets user2 buy an item and become consumer', async () => {
    let instance = await SupplyChain.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    const upc = 5;
    const sellerID = user1;
    const sellerName = 'kartoon';
    const productNotes = 'just a kartoon';
    const productPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.printItem(upc, sellerName, productNotes, productPrice, {
        from: sellerID
    });
    await instance.purchaseItem(upc, {
        from: user2,
        value: balance,
        gasPrice: 0
    });
    const receivedVal = await instance.fetchItemBufferTwo(upc);
    assert.equal(receivedVal[7], user2);
});

it('lets user2 buy an item and user1 ships same item', async () => {
    let instance = await SupplyChain.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    const upc = 6;
    const sellerID = user1;
    const sellerName = 'kartoon';
    const productNotes = 'just a kartoon';
    const productPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.printItem(upc, sellerName, productNotes, productPrice, {
        from: sellerID
    });
    await instance.purchaseItem(upc, {
        from: user2,
        value: balance,
        gasPrice: 0
    });
    await instance.shipItem(upc, accounts[3], {
        from: sellerID
    });
    const receivedVal = await instance.fetchItemBufferTwo(upc);
    assert.equal(receivedVal[5], 2);
});

it('lets user2 buy an item and user2 receives same item', async () => {
    let instance = await SupplyChain.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    const upc = 7;
    const sellerID = user1;
    const consumerID = user2;
    const sellerName = 'kartoon';
    const productNotes = 'just a kartoon';
    const productPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.printItem(upc, sellerName, productNotes, productPrice, {
        from: sellerID
    });
    await instance.purchaseItem(upc, {
        from: consumerID,
        value: balance,
        gasPrice: 0
    });
    await instance.shipItem(upc, accounts[3], {
        from: sellerID
    });
    await instance.receiveItem(upc, {
        from: consumerID
    });
    const receivedVal = await instance.fetchItemBufferTwo(upc);
    assert.equal(receivedVal[7], consumerID);
});
