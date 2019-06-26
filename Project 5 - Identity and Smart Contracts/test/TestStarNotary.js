const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async () => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {
        from: accounts[0]
    });
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!');
});

it('lets user1 put up their star for sale', async () => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {
        from: user1
    });
    await instance.putStarUpForSale(starId, starPrice, {
        from: user1
    });
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async () => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {
        from: user1
    });
    await instance.putStarUpForSale(starId, starPrice, {
        from: user1
    });
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {
        from: user2,
        value: balance
    });
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async () => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {
        from: user1
    });
    await instance.putStarUpForSale(starId, starPrice, {
        from: user1
    });
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {
        from: user2,
        value: balance
    });
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async () => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {
        from: user1
    });
    await instance.putStarUpForSale(starId, starPrice, {
        from: user1
    });
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {
        from: user2,
        value: balance,
        gasPrice: 0
    });
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

it('can add the star name and star symbol properly', async () => {
    let instance = await StarNotary.deployed();
    let receivedName = await instance.name();
    let receivedSymbol = await instance.symbol();
    assert.equal(receivedName, "CryptoStar");
    assert.equal(receivedSymbol, "USD");
});

it('lets 2 users exchange stars', async () => {
    let instance = await StarNotary.deployed();
    let tokenId1 = 6;
    let tokenId2 = 7;
    let userAccount1 = accounts[0];
    let userAccount2 = accounts[1];
    await instance.createStar("CryptoStar 1", tokenId1, {
        from: userAccount1
    });
    await instance.createStar("CryptoStar 2", tokenId2, {
        from: userAccount2
    });
    await instance.exchangeStars(tokenId1, tokenId2);
    assert.equal(await instance.getOwnerByToken(tokenId2), userAccount1);
    assert.equal(await instance.getOwnerByToken(tokenId1), userAccount2);
});

it('lets a user transfer a star', async () => {
    let instance = await StarNotary.deployed();
    let tokenId = 8;
    let userAccount1 = accounts[0];
    let userAccount2 = accounts[1];
    await instance.createStar("Just Another Star!", tokenId, {
        from: userAccount1
    });
    await instance.transferStar(userAccount2, tokenId, {
        from: userAccount1
    });
    assert.equal(await instance.getOwnerByToken(tokenId), userAccount2);
});

it('lookUptokenIdToStarInfo test', async () => {
    let instance = await StarNotary.deployed();
    let tokenId = 9;
    let userAccount = accounts[0];
    await instance.createStar("Super Star!", tokenId, {
        from: userAccount
    });
    assert.equal(await instance.lookUptokenIdToStarInfo(tokenId), "Super Star!");
});