const Blockchain = require('./blockchain');

const bitcoin = new Blockchain();

/*//check for genesis block
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
console.log(hash)*/

//Testing Chain is valid

let chain = {
	"chain": [{
			"index": 1,
			"timestamp": 1555829608792,
			"transactions": [],
			"nonce": 100,
			"hash": "0",
			"previousBlockHash": "0"
		},
		{
			"index": 2,
			"timestamp": 1555829702263,
			"transactions": [{
					"amount": 920,
					"sender": "VEFT1234PAB",
					"recipient": "NIGHT4321OOD",
					"transactionId": "3860c910640211e998a6dfa9087b98ff"
				},
				{
					"amount": 720,
					"sender": "VEFT1234PAB",
					"recipient": "NIGHT4321OOD",
					"transactionId": "54bb6430640211e998a6dfa9087b98ff"
				}
			],
			"nonce": 40464,
			"hash": "0000b2cda2141bc16c706c4e004ba794302c5d2f1b1317b42337c9c2b602f1d2",
			"previousBlockHash": "0"
		},
		{
			"index": 3,
			"timestamp": 1555829752285,
			"transactions": [{
					"amount": 12.5,
					"sender": "00",
					"recipient": "2b229670640211e998a6dfa9087b98ff",
					"transactionId": "62dbb970640211e998a6dfa9087b98ff"
				},
				{
					"amount": 300,
					"sender": "VEFT1234PAB",
					"recipient": "NIGHT4321OOD",
					"transactionId": "7a6ae9d0640211e998a6dfa9087b98ff"
				}
			],
			"nonce": 16446,
			"hash": "0000bd1a1b4594f3c604b59909cdfd86e870a2dd4bd91ef5a625ae120bad284d",
			"previousBlockHash": "0000b2cda2141bc16c706c4e004ba794302c5d2f1b1317b42337c9c2b602f1d2"
		}
	],
	"pendingTransactions": [{
		"amount": 12.5,
		"sender": "00",
		"recipient": "2b229670640211e998a6dfa9087b98ff",
		"transactionId": "80aa7e00640211e998a6dfa9087b98ff"
	}],
	"currentNodeUrl": "http://192.168.55.10:8001",
	"networkNodes": []
};

console.log('VALID: ',bitcoin.chainIsValid(chain.chain))