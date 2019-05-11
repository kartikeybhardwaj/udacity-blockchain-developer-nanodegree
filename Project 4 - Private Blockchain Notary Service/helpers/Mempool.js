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

    getTransactionByAddress(address) {
        return new Promise((resolve, reject) => {
            resolve(this.transactionList.find(tx => tx.address === address));
        });
    }

    getValidatedTransactionByAddress(address) {
        return new Promise((resolve, reject) => {
            resolve(this.validatedTransationList.find(tx => tx.address === address));
        });
    }

    addToTransactionList(address, timestamp) {
        return new Promise((resolve, reject) => {
            const tx = new Transaction.Transaction(address, timestamp);
            this.transactionList.push(tx);
            console.log('TX mempool =>', 'New transaction with address', address, 'has been added.');
            setTimeout(() => {
                this.removeTransaction(tx);
            }, this.timeoutRequestsWindowTime);
        });
    }

    addToValidatedTransactionList(address, timestamp) {
        return new Promise((resolve, reject) => {
            const vtx = new Transaction.Transaction(address, timestamp);
            this.validatedTransationList.push(vtx);
            console.log('VTX mempool =>', 'New transaction with address', address, 'has been added.');
        });
    }

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