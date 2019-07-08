import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';
let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
let flightSuretyData = new web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);

let STATUS_CODES = [{
  "label": "STATUS_CODE_UNKNOWN",
  "code": 0
}, {
  "label": "STATUS_CODE_ON_TIME",
  "code": 10
}, {
  "label": "STATUS_CODE_LATE_AIRLINE",
  "code": 20
}, {
  "label": "STATUS_CODE_LATE_WEATHER",
  "code": 30
}, {
  "label": "STATUS_CODE_LATE_TECHNICAL",
  "code": 40
}, {
  "label": "STATUS_CODE_LATE_OTHER",
  "code": 50
}];

function assignRandomIndex(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function authorizeCaller(caller) {
  return new Promise((resolve, reject) => {
    flightSuretyData.methods.authorizeCaller(config.appAddress).send({
      from: caller
    }).then(result => {
      if (!result) {
        console.error(`Caller: ${caller} is not authorized`);
      }
      return (result ? resolve : reject)(result);
    }).catch(err => {
      reject(err);
    });
  });
}

function initAccounts() {
  return new Promise((resolve, reject) => {
    web3.eth.getAccounts().then(accounts => {
      web3.eth.defaultAccount = accounts[0];
      authorizeCaller(
        accounts[0]
      ).then(result => {
        flightSuretyApp.methods.MINIMUM_FUND().call().then((minimumFund) => {
          flightSuretyApp.methods.fund().send({
            from: accounts[1],
            value: minimumFund,
            gas: 4000000,
            gasPrice: 100000000000
          }).then(() => {
            initREST();
          }).catch(err => {
            console.log(err.message);
          }).then(() => {
            resolve(accounts);
          });
        })
      }).catch(err => {
        console.log(err.message);
        reject(err);
      });
    }).catch(err => {
      reject(err);
    });
  });
}

function initOracles(accounts) {
  return new Promise((resolve, reject) => {
    let rounds = accounts.length;
    let oracles = [];
    flightSuretyApp.methods.REGISTRATION_FEE().call().then(fee => {
      accounts.forEach(account => {
        flightSuretyApp.methods.registerOracle().send({
          from: account,
          value: fee,
          gas: 4000000,
          gasPrice: 100000000000
        }).then(() => {
          flightSuretyApp.methods.getMyIndexes().call({
            from: account
          }).then(result => {
            oracles.push(result);
            console.log(`Oracle Registered: ${result[0]}, ${result[1]}, ${result[2]} at ${account}`);
            rounds -= 1;
            if (!rounds) {
              resolve(oracles);
            }
          }).catch(err => {
            reject(err);
          });
        }).catch(err => {
          reject(err);
        });
      });
    }).catch(err => {
      reject(err);
    });
  });
}

initAccounts().then(accounts => {
  let oracleAccounts = accounts.slice(12, accounts.length);
  initOracles(oracleAccounts).then(oracles => {
    flightSuretyApp.events.OracleRequest({
      fromBlock: "latest"
    }, function (error, event) {
      if (error) {
        console.log(error)
      }
      let airline = event.returnValues.airline;
      let flight = event.returnValues.flight;
      let timestamp = event.returnValues.timestamp;
      let found = false;
      let selectedCode = STATUS_CODES[1];
      let scheduledTime = timestamp;
      // let scheduledTime = timestamp*1000;
      console.log("Selected Code: " + selectedCode)
      console.log(`Flight scheduled to: ${new Date(scheduledTime)}`);
      console.log(scheduledTime - Date.now())
      if (scheduledTime < Date.now()) {
        // disabled to better debugging
        // selectedCode = STATUS_CODES[assignRandomIndex(2, STATUS_CODES.length - 1)];
        selectedCode = STATUS_CODES[2];
      }
      oracles.forEach((oracle, index) => {
        if (found) {
          return false;
        }
        for (let idx = 0; idx < 3; idx += 1) {
          if (found) {
            break;
          }
          if (selectedCode.code === 20) {
            console.log("WILL COVER USERS");
            // flightSuretyApp.methods.creditInsurees(
            // accounts[index],
            flightSuretyData.methods.creditInsurees(
              airline, flight, timestamp
            ).send({
              from: accounts[index]
            }).then(result => {
              console.log(result);
              console.log(`Flight ${flight} got covered and insured the users`);
            }).catch(err => {
              console.log(err.message);
            });
          }
          flightSuretyApp.methods.submitOracleResponse(
            oracle[idx], airline, flight, timestamp, selectedCode.code
          ).send({
            from: accounts[index]
          }).then(result => {
            found = true;
            console.log(`Oracle: ${oracle[idx]} responded from flight ${flight} with status ${selectedCode.code} - ${selectedCode.label}`);
          }).catch(err => {
            console.log(err.message);
          });
        }
      });
    });
  }).catch(err => {
    console.log(err.message);
  });
}).catch(err => {
  console.log(err.message);
});

const app = express();

function initREST() {
  app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    });
  });

  app.get("/activeAirlines", (req, res) => {
    flightSuretyApp.methods.getActiveAirlines().call().then(airlines => {
      console.log(airlines);
      return res.status(200).send(airlines);
    }).catch(err => {
      return res.status(500).send(err);
    });
  });
}

export default app;