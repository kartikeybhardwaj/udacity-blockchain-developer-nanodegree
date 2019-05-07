/* ===== Mempool Class ========================== |
|  Class with a constructor for new mempool       |
|  ============================================= */

const Transaction = require('../models/Transaction.js');
const TimeoutRequestsWindowTime = 5 * 60 * 1000;

class Mempool {
    constructor() {
        this.transactionList = [];
    }

    getTransactionByAddress(address) {
        return new Promise((resolve, reject) => {
            resolve(this.transactionList.find(tx => tx.address === address));
        });
    }

    addTransaction(address) {
        return new Promise(async (resolve, reject) => {
            await this.getTransactionByAddress(address)
                .then((tx) => {
                    const currentTimeStamp = new Date().getTime().toString().slice(0, -3);
                    let requestTimeStamp = currentTimeStamp;
                    let validationWindow = TimeoutRequestsWindowTime / 1000;
                    if (tx === undefined) {
                        tx = new Transaction.Transaction(address);
                        tx.requestedAt = currentTimeStamp;
                        this.transactionList.push(tx);
                        setTimeout(() => {
                            this.removeTransaction(tx).then((wasAvailableAndRemoved) => {
                                if (wasAvailableAndRemoved) {
                                    console.log('Transaction with address', address, 'has been timed out.');
                                }
                            });
                        }, TimeoutRequestsWindowTime);
                    } else {
                        requestTimeStamp = tx.requestedAt;
                        const timeElapse = currentTimeStamp - requestTimeStamp;
                        const timeLeft = (TimeoutRequestsWindowTime / 1000) - timeElapse;
                        validationWindow = timeLeft;
                    }
                    resolve({
                        walletAddress: address,
                        requestTimeStamp: requestTimeStamp,
                        message: address.concat(':').concat(requestTimeStamp).concat(':').concat('starRegistry'),
                        validationWindow: validationWindow
                    });
                });
        });
    }

    removeTransaction(tx) {
        return new Promise((resolve, reject) => {
            const indexOfTx = this.transactionList.map((_) => {
                return _.address;
            }).indexOf(tx.address);
            if (indexOfTx !== -1) {
                this.transactionList.splice(indexOfTx, 1);
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }
}

module.exports.Mempool = Mempool;