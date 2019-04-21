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

    chainIsValid(blockChain) {
        let validChain = true;
        for( let i=1; i < blockChain.length; ++i) {
            let currentBlock = blockChain[i];
            let prevBlock = blockChain[i -1];
            let currBody = {
                transactions: currentBlock['transactions'],
                index: currentBlock['index']
            }
            
            let blockHash = this.hashBlock(prevBlock['hash'], currBody, currentBlock['nonce'])

            if (blockHash.substring(0,4) != '0000') validChain = false;

            if (currentBlock['previousBlockHash'] !== prevBlock['hash']) validChain = false//invalid chain
        }

        const genesisBlock = blockChain[0];
        const correctNonce = genesisBlock['nonce'] === 100;
        const correctPreviousBlockHash = genesisBlock['previousBlockHash'] === '0';
        const correctHash = genesisBlock['hash'] === '0';
        const correctTransactions = genesisBlock['transactions'].length === 0;

        if(!(correctNonce && correctPreviousBlockHash && correctHash && correctTransactions)) validChain = false;

        return validChain;
    }

    getBlock(blockHash) {
        let correctBlock = null;

        this.chain.forEach(block => {
            if (block.hash === blockHash) {
                correctBlock = block;
            } 
        })

        return correctBlock;
    }

    getTransaction(transactionId) {
        let correctTransaction = null;
        let correctBlock = null;

        this.chain.forEach(block => {
            block.transactions.forEach(transaction => {
                if (transaction.transactionId === transactionId) {
                    correctTransaction = transaction;
                    correctBlock = block;
                    return {
                        transaction: correctTransaction,
                        block: correctBlock
                    };
                }
            })
        })

        return {
            transaction: correctTransaction,
            block: correctBlock
        };
    }

    getAddressTransactions(address) {
        let addressTransactions = [];
        let balance = 0;

        this.chain.forEach(block => {
            block.transactions.forEach(transaction => {
                let isRecipient = transaction.recipient === address;
                let isSender = transaction.sender === address;

                if(isRecipient || isSender) {
                    addressTransactions.push(transaction);
                }

                if(isRecipient) {
                    balance += transaction.amount;
                }else if(isSender) {
                    balance -= transaction.amount;
                }
            })
        })

        return {
            address: address,
            balance: balance,
            transactions: addressTransactions
        }
    }
}

module.exports = Blockchain;

