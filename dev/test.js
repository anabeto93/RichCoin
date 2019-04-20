const Blockchain = require('./blockchain');

const bitcoin = new Blockchain();

//check for genesis block
console.log(bitcoin);

const previousBlockHash = '2AC9A6746ACA543'
const currentBlockData = [
    {
        amount: 10,
        sender: '2AC9A6746ACAABC',
        recipient: '2AC9A6746ACACAB'
    },
    {
        amount: 92,
        sender: '2AC9A6746ACADAB',
        recipient: '2AC9A6746ACABAC'
    },
    {
        amount: 47,
        sender: '2AC9A6746ACARED',
        recipient: '2AC9A6746ACABLU'
    }
];

const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);

let hash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce)

console.log('Nonce is ',nonce);
console.log(bitcoin);
console.log(hash)

//Testing HashBlock