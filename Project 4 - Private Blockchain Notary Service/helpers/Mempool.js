/* ===== Mempool Class ========================== |
|  Class with a constructor for new mempool       |
|  ============================================= */

const Transaction = require('../models/Transaction.js');

class Mempool {
    constructor() {
        this.timeoutRequestsWindowTime = 5 * 60 * 1000;
        this.transactionList = [];
        this.validatedTransationList = [];
    }

    // Get transaction, it is a helper method that return transaction from mempool
    getTransactionByAddress(address) {
        return new Promise((resolve, reject) => {
            resolve(this.transactionList.find(tx => tx.address === address));
        });
    }

    // Get validated transaction, it is a helper method that return validated transaction from mempool
    getValidatedTransactionByAddress(address) {
        return new Promise((resolve, reject) => {
            resolve(this.validatedTransationList.find(tx => tx.address === address));
        });
    }

    // add transaction, it is a helper method that adds transaction to mempool
    addToTransactionList(address, timestamp) {
        return new Promise((resolve, reject) => {
            const tx = new Transaction.Transaction(address, timestamp);
            this.transactionList.push(tx);
            console.log('TX mempool =>', 'New transaction with address', address, 'has been added.');
            setTimeout(() => {
                // remove transaction if request timeouts
                this.removeTransaction(tx);
            }, this.timeoutRequestsWindowTime);
        });
    }

    // add transaction, it is a helper method that adds validated transaction to mempool
    addToValidatedTransactionList(address, timestamp) {
        return new Promise((resolve, reject) => {
            const vtx = new Transaction.Transaction(address, timestamp);
            this.validatedTransationList.push(vtx);
            console.log('VTX mempool =>', 'New transaction with address', address, 'has been added.');
        });
    }

    // remove transaction, it is a helper method that removes transaction from mempool
    removeTransaction(tx) {
        return new Promise((resolve, reject) => {
            const indexOfTx = this.transactionList.map((_) => {
                return _.address;
            }).indexOf(tx.address);
            if (indexOfTx !== -1) {
                this.transactionList.splice(indexOfTx, 1);
                console.log('TX mempool =>', 'Transaction with address', tx.address, 'has been removed.');
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }

    // remove transaction, it is a helper method that removes validated transaction from mempool
    removeValidatedTransaction(vtx) {
        return new Promise((resolve, reject) => {
            const indexOfVtx = this.validatedTransationList.map((_) => {
                return _.address;
            }).indexOf(vtx.address);
            if (indexOfVtx !== -1) {
                this.validatedTransationList.splice(indexOfVtx, 1);
                console.log('VTX mempool =>', 'Transaction with address', vtx.address, 'has been removed.');
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }

}

module.exports.Mempool = Mempool;