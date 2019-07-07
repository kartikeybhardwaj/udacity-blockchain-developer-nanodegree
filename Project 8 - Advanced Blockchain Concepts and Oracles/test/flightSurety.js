var Test = require('../config/testConfig.js');
// var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

    var config;

    // let lastSnapshot;

    before('setup contract', async () => {
        // // creates a snapshot of the accounts, to avoid lack of funds after multiple tests without restarting Ganache
        // await web3.currentProvider.send({
        //     jsonrpc: "2.0",
        //     method: "evm_snapshot"
        // }, function (err, res) {
        //     lastSnapshot = parseInt(res.result, 0);
        // });
        // init test data
        config = await Test.Config(accounts);
        // authorizes app contract to call data contract
        await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
    });

    // after(async () => {
    //     // reverts accounts from last snapshot
    //     await web3.currentProvider.send({
    //         jsonrpc: '2.0',
    //         method: 'evm_revert',
    //         params: lastSnapshot
    //     });
    // });

    /****************************************************************************************/
    /* Operations and Settings                                                              */
    /****************************************************************************************/

    it(`(multiparty) has correct initial isOperational() value`, async function () {
        // Get operating status
        let status = await config.flightSuretyData.isOperational.call();
        assert.equal(status, true, "Incorrect initial operating status value");
    });

    it(`(multiparty) has first airline registered automatically`, async function () {
        // Get operating status
        let status = await config.flightSuretyData.isAirline.call(config.firstAirline);
        assert.equal(status, true, "First airline not registered automatically");
    });

    it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {
        // Ensure that access is denied for non-Contract Owner account
        let accessDenied = false;
        try {
            await config.flightSuretyData.setOperatingStatus(false, {
                from: config.testAddresses[2]
            });
        } catch (e) {
            accessDenied = true;
        }
        assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
    });

    it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {
        // Ensure that access is allowed for Contract Owner account
        let accessDenied = false;
        try {
            await config.flightSuretyData.setOperatingStatus(false);
        } catch (e) {
            accessDenied = true;
        }
        assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
    });

    it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {
        await config.flightSuretyData.setOperatingStatus(false);
        let reverted = false;
        try {
            await config.flightSurety.setTestingMode(true);
        } catch (e) {
            reverted = true;
        }
        assert.equal(reverted, true, "Access not blocked for requireIsOperational");
        // Set it back for other tests to work
        await config.flightSuretyData.setOperatingStatus(true);
    });

    it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
        // ARRANGE
        let secondAirline = accounts[2];
        // ACT
        try {
            await config.flightSuretyApp.registerAirline(secondAirline, "Airline 2", {
                from: config.firstAirline
            });
        } catch (e) {}
        let result = await config.flightSuretyData.isAirline.call(secondAirline);
        // ASSERT
        assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");
    });

    it('(airline) can register an Airline using registerAirline() if it is funded', async () => {
        // ARRANGE
        let secondAirline = accounts[2];
        // ACT
        try {
            let minimumFund = await config.flightSuretyApp.MINIMUM_FUND.call();
            await config.flightSuretyApp.fund({
                from: config.firstAirline,
                value: minimumFund
            });
            await config.flightSuretyApp.registerAirline(secondAirline, "Airline 2", {
                from: config.firstAirline
            });
        } catch (e) {}
        let result = await config.flightSuretyData.isAirline.call(secondAirline);
        // ASSERT
        assert.equal(result, true, "Airline should be able to register another airline if it has provided funding");
    });

    it('(airline) can register only 4 airlines using registerAirline() without the need of consensus', async () => {
        // ARRANGE 
        // Note: firstAirline and secondAirline are already registered
        let thirdAirline = accounts[3];
        let fourthAirline = accounts[4];
        let fifthAirline = accounts[5];
        // ACT
        try {
            let minimumFund = await config.flightSuretyApp.MINIMUM_FUND.call();
            await config.flightSuretyApp.fund({
                from: config.firstAirline,
                value: minimumFund
            });
            await config.flightSuretyApp.registerAirline(thirdAirline, "Airline 3", {
                from: config.firstAirline
            });
            await config.flightSuretyApp.registerAirline(fourthAirline, "Airline 4", {
                from: config.firstAirline
            });
            await config.flightSuretyApp.registerAirline(fifthAirline, "Airline 5", {
                from: config.firstAirline
            });
        } catch (e) {}
        let resultIsAirline3 = await config.flightSuretyData.isAirline.call(thirdAirline);
        let resultIsAirline4 = await config.flightSuretyData.isAirline.call(fourthAirline);
        let resultIsAirline5 = await config.flightSuretyData.isAirline.call(fifthAirline);
        // ASSERT
        assert.equal(resultIsAirline3, true, "First airline should be able to register a third airline if it has provided funding");
        assert.equal(resultIsAirline4, true, "First airline should be able to register a fourth airline if it has provided funding");
        assert.equal(resultIsAirline5, false, "First airline should not be able to register a fifth airline without consensus");
        assert.equal(await config.flightSuretyData.getAirlinesCount(), 4);
    });

    it('(airline) can register another airline with at least 50% of consensus', async () => {
        // ARRANGE 
        // Note: four airlines are already registered
        let firstAirline = config.firstAirline;
        let secondAirline = accounts[2];
        let thirdAirline = accounts[3];
        let fourthAirline = accounts[4];
        let fifthAirline = accounts[5];
        // ACT
        try {
            let minimumFund = await config.flightSuretyApp.MINIMUM_FUND.call();
            await config.flightSuretyApp.fund({
                from: secondAirline,
                value: minimumFund
            });
            await config.flightSuretyApp.fund({
                from: thirdAirline,
                value: minimumFund
            });
            await config.flightSuretyApp.registerAirline(fifthAirline, "Airline 5", {
                from: firstAirline
            });
            await config.flightSuretyApp.registerAirline(fifthAirline, "Airline 5", {
                from: secondAirline
            });
            await config.flightSuretyApp.registerAirline(fifthAirline, "Airline 5", {
                from: thirdAirline
            });
        } catch (e) {}
        let result = await config.flightSuretyData.isAirline.call(fifthAirline);
        // ASSERT
        assert.equal(result, true, "Fifth airline should be registered by consensus");
        assert.equal(await config.flightSuretyData.getAirlinesCount(), 5);
    });

    it('(airline) cannot register another airline with less than 50% of consensus', async () => {
        // ARRANGE 
        // Note: five airlines are already registered
        let firstAirline = config.firstAirline;
        let secondAirline = accounts[2];
        let thirdAirline = accounts[3];
        let fourthAirline = accounts[4];
        let fifthAirline = accounts[5];
        let sixthAirline = accounts[6];
        // ACT
        try {
            await config.flightSuretyApp.registerAirline(sixthAirline, "Airline 6", {
                from: firstAirline
            });
            await config.flightSuretyApp.registerAirline(sixthAirline, "Airline 6", {
                from: secondAirline
            });
        } catch (e) {}
        let result = await config.flightSuretyData.isAirline.call(sixthAirline);
        // ASSERT
        assert.equal(result, false, "Sixth airline should not be registered without consensus");
        assert.equal(await config.flightSuretyData.getAirlinesCount(), 5);
    });

    it('(airline) cannot register a flight that has old timestamp', async () => {
        // ARRANGE
        let airlineName = "BC0000";
        let timestamp = Math.trunc(((new Date()).getTime() - 3 * 3600) / 1000);
        // ACT
        try {
            await expectThrow(
                config.flightSuretyApp.registerFlight(airlineName, timestamp, {
                    from: config.firstAirline
                })
            );
        } catch (e) {
            assert.fail(e.message);
        }
    });

    it('(passenger) can buy insurance for a flight paying up to 1 ether', async () => {
        // ARRANGE
        let passengerAccount = config.testAddresses[0];
        let airlineName = "BC0001";
        let timestamp = Math.trunc(((new Date()).getTime() + 3 * 3600) / 1000);
        let amountPaid = web3.utils.toWei("0.5", "ether");
        // ACT
        try {
            await config.flightSuretyApp.registerFlight(airlineName, timestamp, {
                from: config.firstAirline
            });
            await config.flightSuretyApp.buyInsurance(config.firstAirline, airlineName, timestamp, {
                from: passengerAccount,
                value: amountPaid
            });
        } catch (e) {
            assert.fail(e.message);
        }
        // ASSERT
        let result = await config.flightSuretyData.getAmountPaidByInsuree.call(config.firstAirline, airlineName, timestamp, {
            from: passengerAccount
        });
        assert.equal(result, amountPaid);
    });

    it('(passenger) cannot buy insurance for a flight paying more than 1 ether', async () => {
        // ARRANGE
        let passengerAccount = config.testAddresses[0];
        let airlineName = "BC0002";
        let timestamp = Math.trunc(((new Date()).getTime() + 3 * 3600) / 1000);
        let amountPaid = web3.utils.toWei("1.1", "ether");
        // ACT
        try {
            await config.flightSuretyApp.registerFlight(airlineName, timestamp, {
                from: config.firstAirline
            });
            await expectThrow(
                config.flightSuretyApp.buyInsurance(config.firstAirline, airlineName, timestamp, {
                    from: passengerAccount,
                    value: amountPaid
                })
            );
        } catch (e) {
            assert.fail(e.message);
        }
    });

    it('(passengers) receive credit for the insurance bought and only once', async () => {
        // ARRANGE
        let passengerAccount1 = config.testAddresses[1];
        let passengerAccount2 = config.testAddresses[2];
        let airlineName = "BC0004";
        let timestamp = Math.trunc(((new Date()).getTime() + 3 * 3600) / 1000);
        let passengerAmountPaid1 = web3.utils.toWei("0.4", "ether");
        let passengerAmountPaid2 = web3.utils.toWei("0.8", "ether");
        let insuranceReturnPercentage = 150;
        let fundsBefore;
        let fundsAfter;
        // ACT
        try {
            fundsBefore = await config.flightSuretyData.getFund(config.firstAirline);
            await config.flightSuretyApp.registerFlight(airlineName, timestamp, {
                from: config.firstAirline
            });
            await config.flightSuretyApp.buyInsurance(config.firstAirline, airlineName, timestamp, {
                from: passengerAccount1,
                value: passengerAmountPaid1
            });
            await config.flightSuretyApp.buyInsurance(config.firstAirline, airlineName, timestamp, {
                from: passengerAccount2,
                value: passengerAmountPaid2
            });
            await config.flightSuretyData.creditInsurees(insuranceReturnPercentage, config.firstAirline, airlineName, timestamp, {
                from: config.owner
            });
            await expectThrow(config.flightSuretyData.creditInsurees(insuranceReturnPercentage, config.firstAirline, airlineName, timestamp, {
                from: config.owner
            }));
            fundsAfter = await config.flightSuretyData.getFund(config.firstAirline);
        } catch (e) {
            assert.fail(e.message);
        }
        // ASSERT
        // Passenger1
        let resultPassengerAmountPaid1 = await config.flightSuretyApp.getAmountPaidByInsuree.call(config.firstAirline, airlineName, timestamp, {
            from: passengerAccount1
        });
        assert.equal(resultPassengerAmountPaid1, passengerAmountPaid1);
        let resultPassengerAmountCredit1 = await config.flightSuretyData.getInsureePayoutCredits.call(passengerAccount1, {
            from: passengerAccount1
        });
        assert.equal(resultPassengerAmountCredit1, passengerAmountPaid1 * insuranceReturnPercentage / 100);
        // Passenger2
        let resultPassengerAmountPaid2 = await config.flightSuretyApp.getAmountPaidByInsuree.call(config.firstAirline, airlineName, timestamp, {
            from: passengerAccount2
        });
        assert.equal(resultPassengerAmountPaid2, passengerAmountPaid2);
        let resultPassengerAmountCredit2 = await config.flightSuretyData.getInsureePayoutCredits.call(passengerAccount2, {
            from: passengerAccount2
        });
        assert.equal(resultPassengerAmountCredit2, passengerAmountPaid2 * insuranceReturnPercentage / 100);
        // Airline fund
        assert.equal(Number(fundsAfter), Number(fundsBefore.add(passengerAmountPaid1).add(passengerAmountPaid2).sub(resultPassengerAmountCredit1).sub(resultPassengerAmountCredit2)));
    });

});

let expectThrow = async function (promise) {
    try {
        await promise;
    } catch (error) {
        assert.exists(error);
        return;
    }
    assert.fail("Expected an error but didn't see one");
}