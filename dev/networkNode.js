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
    const blockIndex = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient)
    res.json({ note: "Transaction will be added in block "+blockIndex.toString()})
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

    //simply reward this person for mining the block
    //console.log('Node address ',nodeAddress)
    bitcoin.createNewTransaction(12.5, "00", nodeAddress)

    let newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash)
    res.json({
        note: 'New block mined',
        data: newBlock
    })
}) 

// register a node and broadcast it to the network
app.post('/register-and-broadcast-node', function(req, res) {
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
    const newNodeUrl = req.body.newNodeUrl;
    let nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(newNodeUrl) == -1;
    let notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;

    if(nodeNotAlreadyPresent && notCurrentNode) bitcoin.networkNodes.push(newNodeUrl);
    res.json({ note: 'New node registered successfully with node.' })
})


app.post('/register-nodes-bulk', function(req, res) {

})
 
app.listen(port, '192.168.55.10', function() {
    console.log(`Listening on ${port}...`)
})