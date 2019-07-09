import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';

import Config from './config.json';
import Web3 from 'web3';

export default class Contract {

    constructor(network, callback) {
        let config = Config[network];
        // this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
    }

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {
            this.owner = accts[0];
            let counter = 1;
            while (this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }
            while (this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }
            callback();
        });
    }

    isOperational(callback) {
        let self = this;
        self.flightSuretyApp.methods
            .isOperational()
            .call({
                from: self.owner
            }, callback);
    }

    isAirline(airlineAccount, callback) {
        let self = this;
        self.flightSuretyApp.methods
            .isAirline(airlineAccount)
            .call({
                from: self.owner
            }, callback);
    }

    isAirlineFunded(airlineAccount, callback) {
        let self = this;
        self.flightSuretyData.methods
            .isAirlineFunded(airlineAccount)
            .call({
                from: self.owner
            }, callback);
    }

    registerAirline(airlineAccount, fromAccount, callback) {
        let self = this;
        self.flightSuretyApp.methods
            .registerAirline(airlineAccount)
            .send({
                from: fromAccount,
                gas: 4000000,
                gasPrice: 100000000000
            })
            .then(this.flightSuretyData.events.evntRegisterAirline({
                    fromBlock: "latest"
                },
                function (error, event) {
                    callback(error, event.returnValues);
                }));
    }

    fund(airlineAccount, callback) {
        let self = this;
        self.flightSuretyApp.methods
            .fund()
            .send({
                from: airlineAccount,
                value: this.web3.utils.toWei("10", "ether"),
                gas: 4000000,
                gasPrice: 100000000000
            }, callback);
    }

    buy(passengerAccount, airlineAccount, airlineName, timestamp, callback) {
        let self = this;
        self.flightSuretyApp.methods
            .buy(airlineAccount, airlineName, timestamp)
            .send({
                from: passengerAccount,
                value: this.web3.utils.toWei("1", "ether"),
                gas: 4000000,
                gasPrice: 100000000000
            }, callback);

    }

    registerFlight(airlineAccount, airlineName, timestamp, callback) {
        let self = this
        self.flightSuretyApp.methods
            .registerFlight(airlineAccount, airlineName, timestamp)
            .send({
                from: airlineAccount,
                gas: 4000000,
                gasPrice: 100000000000
            }, callback);
    }

    fetchFlightStatus(airlineAccount, airlineName, timestamp, callback) {
        let self = this;
        self.flightSuretyApp.methods
            .fetchFlightStatus(airlineAccount, airlineName, timestamp)
            .send({
                from: self.owner
            }, (error, result) => {
                callback(error, result);
            });
    }

    async accountBalance(account) {
        let balance = await this.web3.eth.getBalance(account);
        return await this.web3.utils.fromWei(balance);
    }

    checkCredit(passengerAccount, callback) {
        let self = this;
        self.flightSuretyApp.methods
            .checkCredit()
            .call({
                    from: passengerAccount,
                    gas: 4000000,
                    gasPrice: 100000000000
                },
                callback);
    }

    passengerPaid(passengerAccount, airlineAccount, airlineName, timestamp, callback) {
        let self = this;
        self.FlightSuretyData.methods
            .boughtPassenger(passengerAccount, airlineAccount, airlineName, timestamp)
            .call({
                from: passengerAccount,
                gas: 4000000,
                gasPrice: 10000000000
            }, callback);
    }

    pay(passengerAccount, airlineAccount, airlineName, timestamp, callback) {
        let self = this;
        self.flightSuretyApp.methods
            .pay(passengerAccount, airlineAccount, airlineName, timestamp)
            .send({
                from: passengerAccount
            }, callback);
    }

}