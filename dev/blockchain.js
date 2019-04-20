const sha256 = require('sha256');
const currentNodeUrl = process.argv[3];
const uuid = require('uuid/v1')

class Blockchain {
    constructor() {
        this.chain = [];
        this.pendingTransactions = [];

        this.currentNodeUrl = currentNodeUrl;
        this.networkNodes = [];

        //genesis block
        this.createNewBlock(100,'0','0');
    }

    createNewBlock(nonce, previousBlockHash, hash) {
        const newBlock = {
            index: this.chain.length + 1,
            timestamp: Date.now(),
            transactions: this.pendingTransactions,
            nonce: nonce,
            hash: hash,
            previousBlockHash: previousBlockHash
        }

        //clear out the pendingTransactions
        this.pendingTransactions = [];
        this.chain.push(newBlock);
        return newBlock;
    }

    getLastBlock() {
        return this.chain[this.chain.length -1];
    }

    createNewTransaction(amount, sender, recipient) {
        const newTransaction = {
            amount: amount,
            sender: sender,
            recipient: recipient,
            transactionId: uuid().split('-').join('')
        };

        /*this.pendingTransactions.push(newTransaction);

        return this.getLastBlock()['index'] + 1;*/
        return newTransaction;
    }

    addTransactionToPendingTransactions(transObj) {
        this.pendingTransactions.push(transObj);

        return this.getLastBlock()['index'] + 1;
    }

    hashBlock(previousBlockHash, currentBlockdata, nonce) {
        const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockdata);
        const hash = sha256(dataAsString);
        return hash;
    }

    proofOfWork(previousBlockHash, currentBlockdata) {
        let nonce = 0;
        let hash = this.hashBlock(previousBlockHash, currentBlockdata, nonce);
        while(hash.substring(0,4) != '0000') {
            nonce++;
            hash = this.hashBlock(previousBlockHash, currentBlockdata, nonce);
        }

        return nonce;
    }
}

module.exports = Blockchain;

