const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const Blockchain = require('./blockchain')
const uuid = require('uuid/v1')

const port = process.argv[2]; //first argument of the file after name

const rp = require('request-promise')

const nodeAddress = uuid().split('-').join('') //basically remove all dashes

const bitcoin = new Blockchain()
 
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false}))


app.get('/', function (req, res) {
  res.send('Hello Richard, This is RichCoin')
})

app.get('/blockchain', function(req, res) {
    console.log('Getting the blockchain')
    res.send(bitcoin)
})

app.post('/transaction', function(req, res) {
    console.log('Called to create a transaction ')
    console.log(req.body)
    /*const blockIndex = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient)
    res.json({ note: "Transaction will be added in block "+blockIndex.toString()})*/
    const newTransaction = req.body;
    let blockIndex = bitcoin.addTransactionToPendingTransactions(newTransaction);
    res.json({ note: "Transaction will be added in block "+blockIndex.toString()})
})

app.post('/transaction/broadcast', function(req, res) {
    const amount = req.body.amount;
    const sender = req.body.sender;
    const recipient = req.body.recipient;

    const newTransaction = bitcoin.createNewTransaction(amount, sender, recipient);

    bitcoin.addTransactionToPendingTransactions(newTransaction);

    const requestPromises = [];
    //broadcast to all other nodes in the network
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/transaction',
            method: 'POST',
            body: newTransaction,
            json: true
        }

        requestPromises.push( rp(requestOptions) )
    })

    Promise.all(requestPromises)
    .then(data => {
        //really not much or anything to do here
        res.json({ note: 'Transaction created and broadcast successfully.'})
    });
})
 
app.get('/mine', function(req, res) {
    console.log('Mining a new block')
    const lastBlock = bitcoin.getLastBlock()
    let previousBlockHash = lastBlock['hash']
    
    let currentBlock = {
        transactions: bitcoin.pendingTransactions,
        index: lastBlock['index']+1
    }

    let nonce = bitcoin.proofOfWork(previousBlockHash, currentBlock)
    let blockHash = bitcoin.hashBlock(previousBlockHash, currentBlock, nonce)

    let newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash)

    //broadcast new block to all other nodes
    const blockPromises = [];

    bitcoin.networkNodes.forEach(networkNodeUrl => {
        let requestOptions = {
            uri: networkNodeUrl + '/receive-new-block',
            method: 'POST',
            body: newBlock,
            json: true
        }

        blockPromises.push( rp(requestOptions) )
    })

    Promise.all(blockPromises)
    .then(data => {
        // create a reward transaction and then broadcast it to all
        //simply reward this person for mining the block
        //bitcoin.createNewTransaction(12.5, "00", nodeAddress)
        let rewardOption = {
            uri: bitcoin.currentNodeUrl + '/transaction/broadcast',
            method: 'POST',
            body: {
                amount: 12.5,
                sender: "00",
                recipient: nodeAddress
            },
            json: true
        };

        return rp(rewardOption)
    })
    .then(data => {
        res.json({
            note: 'New block mined & broadcast successfully',
            data: newBlock
        })
    }) 
}) 

app.post('/receive-new-block', function(req, res) {
    console.log('Receiving new block ', req.body)
    const newBlock = req.body
    let lastBlock = bitcoin.getLastBlock()
    let correctHash = lastBlock.hash === newBlock.previousBlockHash
    let correctIndex = lastBlock['index'] +1 === newBlock['index']

    if(correctHash && correctIndex) {
        bitcoin.chain.push(newBlock)
        //clear out the pending transactions
        bitcoin.pendingTransactions = []
        res.json({
            note: 'New block received and accepted.',
            newBlock: newBlock
        })
    } else {
        res.json({
            note: 'New block rejected.',
            newBlock: newBlock
        })
    }
})

// register a node and broadcast it to the network
app.post('/register-and-broadcast-node', function(req, res) {
    console.log('To register and broadcast new node', req.body)
    const newNodeUrl = req.body.newNodeUrl;
    if (bitcoin.networkNodes.indexOf(newNodeUrl) == -1) bitcoin.networkNodes.push(newNodeUrl)

    const regNodesPromises = [];

    bitcoin.networkNodes.forEach(networkNodeUrl => {
        // hit the '/register-node'
        const requestOptions = {
            uri: networkNodeUrl + '/register-node',
            method: 'POST',
            body: { newNodeUrl: newNodeUrl },
            json: true
        };

        regNodesPromises.push( rp(requestOptions) )
    });

    Promise.all(regNodesPromises)
    .then(data => {
        // use the data received from sending the request
        const bulkRegistrationOptions = {
            uri: newNodeUrl + '/register-nodes-bulk',
            method: 'POST',
            body: { allNetworkNodes: [ ...bitcoin.networkNodes, bitcoin.currentNodeUrl ] },
            json: true
        };

        return rp( bulkRegistrationOptions )
    })
    .then( data => {
        res.json({ note: 'New node registered with network successfully.'})
    })
})

// register a node with the network
app.post('/register-node', function(req, res) {
    console.log('Called to register a new node', req.body)
    const newNodeUrl = req.body.newNodeUrl;
    let nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(newNodeUrl) == -1;
    let notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;

    if(nodeNotAlreadyPresent && notCurrentNode) bitcoin.networkNodes.push(newNodeUrl);
    res.json({ note: 'New node registered successfully.' })
})

// register multiple nodes at once
app.post('/register-nodes-bulk', function(req, res) {
    console.log('Called to do bulk registration ', req.body)
    const allNodes = req.body.allNetworkNodes;
    allNodes.forEach(networkNodeUrl => {
        //register with network node url with the currentNode
        let nodeNotPresent = bitcoin.networkNodes.indexOf(networkNodeUrl) == -1;
        let notCurrentNode = bitcoin.currentNodeUrl !== networkNodeUrl; 
        if (nodeNotPresent && notCurrentNode) bitcoin.networkNodes.push(networkNodeUrl);
    })

    res.json({ note: 'Bulk registration successful.' })
})

app.get('/consensus', function(req, res) {
    console.log('Consensus on block validity ', req.body)
    const requestPromises = [];
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/blockchain',
            method: 'GET',
            json: true
        };

        requestPromises.push( rp(requestOptions) )
    })

    Promise.all(requestPromises)
    .then(blockchains => {
        let currentChainLength = bitcoin.chain.length;
        let maxChainLength = currentChainLength;
        let newLongestChain = null;
        let newPendingTransactions = null;
        blockchains.forEach(blockchain => {
            if (blockchain.chain.length > maxChainLength) {
                maxChainLength = blockchain.chain.length
                newLongestChain = blockchain.chain
                newPendingTransactions = blockchain.pendingTransactions
            }
        })

        if (!newLongestChain || (newLongestChain && !bitcoin.chainIsValid(newLongestChain))) {
            res.json({
                note: 'Current chain has not been replaced',
                chain: bitcoin.chain
            })
        } else if(newLongestChain&& bitcoin.chainIsValid(newLongestChain)) {
            bitcoin.chain = newLongestChain
            bitcoin.pendingTransactions = newPendingTransactions
            res.json({
                note: 'This chain has been replaced',
                chain: newLongestChain
            })
        }
    })
})


app.get('/block/:blockHash', function(req, res) {

})

app.get('/transaction/:transactionId', function(req, res) {

})

app.get('/address/:address', function(req, res) {

})

 
app.listen(port, '192.168.55.10', function() {
    console.log(`Listening on ${port}...`)
})