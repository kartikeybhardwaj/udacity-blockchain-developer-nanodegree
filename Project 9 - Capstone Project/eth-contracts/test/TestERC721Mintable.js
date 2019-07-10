var ERC721Mintable = artifacts.require('HouseERC721Token');

contract('TestERC721Mintable', accounts => {

    const account_one = accounts[0];
    const account_two = accounts[1];
    const account_three = accounts[2];

    describe('match erc721 spec', function () {
        beforeEach(async function () {
            this.contract = await ERC721Mintable.new({
                from: account_one
            });
            // mint multiple tokens
            await this.contract.mint(account_two, 20);
            await this.contract.mint(account_two, 21);
            await this.contract.mint(account_two, 22);
            await this.contract.mint(account_two, 23);
            await this.contract.mint(account_two, 24);
            await this.contract.mint(account_two, 25);
            await this.contract.mint(account_two, 26);
            await this.contract.mint(account_two, 27);
            await this.contract.mint(account_two, 28);
            await this.contract.mint(account_two, 29);
            await this.contract.mint(account_three, 30);
            await this.contract.mint(account_three, 31);
            await this.contract.mint(account_three, 32);
            await this.contract.mint(account_three, 33);
            await this.contract.mint(account_three, 34);
            await this.contract.mint(account_three, 35);
            await this.contract.mint(account_three, 36);
            await this.contract.mint(account_three, 37);
            await this.contract.mint(account_three, 38);
            await this.contract.mint(account_three, 39);
        });

        it('should return total supply', async function () {
            const supply = await this.contract.totalSupply();
            assert.equal(supply, 20, "Incorrect total suppy");
        });

        it('should get token balance', async function () {
            const accountTwoBalance = await this.contract.balanceOf(account_two);
            assert.equal(accountTwoBalance, 10, 'Incorrect account balance');
        });

        // token uri should be complete i.e: https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1
        it('should return token uri', async function () {
            const tokenURI = await this.contract.tokenURI(21);
            assert.equal(tokenURI, 'https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/21', 'Incorrect token uri');
        });

        it('should transfer token from one owner to another', async function () {
            await this.contract.transferFrom(account_two, account_three, 29, {
                from: account_two
            });
            const newOwner = await this.contract.ownerOf(29);
            assert.equal(newOwner, account_three, 'Incorrect new owner');
        });
    });

    describe('have ownership properties', function () {
        beforeEach(async function () {
            this.contract = await ERC721Mintable.new({
                from: account_one
            });
        });

        it('should fail when minting when address is not contract owner', async function () {
            await expectThrow(this.contract.mint(account_two, 20, {
                from: account_two
            }));
        });

        it('should return contract owner', async function () {
            const contractOwner = await this.contract.getOwner();
            assert.equal(contractOwner, account_one, 'Incorrect contract owner');
        });

    });
});

var expectThrow = async function (promise) {
    try {
        await promise;
    } catch (error) {
        assert.exists(error);
        return;
    }
    assert.fail('Expected an error but didnt see one!');
}