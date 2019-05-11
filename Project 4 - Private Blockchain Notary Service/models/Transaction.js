/* ===== Mempool Class ===========================  |
|  Class with a constructor for Mempool             |
|  ================================================*/

class Transaction {
    constructor(address, timestamp) {
        this.address = address;
        this.requestedAt = timestamp;
    }
}

module.exports.Transaction = Transaction;