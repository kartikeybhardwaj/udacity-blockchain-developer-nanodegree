/* ===== Mempool Class ===========================  |
|  Class with a constructor for Mempool             |
|  ================================================*/

class Transaction {
    constructor(address) {
        this.address = address;
        this.requestedAt = '';
    }
}

module.exports.Transaction = Transaction;