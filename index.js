const express = require('express')
const Web3 = require('web3')
const {MongoClient} = require('mongodb')
const { Storage } = require('@google-cloud/storage')
const { GoogleAuth } = require('google-auth-library')
require('dotenv').config();


const MONGODB_URI = process.env.MONGODB_URI;
//console.log(process.env.MONGODB_URI)
// check the MongoDB URI
if (!MONGODB_URI) {
  throw new Error("Define the MONGODB_URI environmental variable");
}

let cachedClient= null;
let cachedDb = null;

async function connectToDatabase() {
  // check the cached.
  if (cachedClient && cachedDb) {
    // load from cache
    return {
      client: cachedClient,
      db: cachedDb,
    };
  }

  // Connect to cluster
  let client = new MongoClient(MONGODB_URI);
  await client.connect();
  let db = client.db();

  // set cache
  cachedClient = client;
  cachedDb = db;

  return {
    client: cachedClient,
    db: cachedDb,
  };
}

const abi = [{
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
        {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }
    ],
    "stateMutability": "view",
    "type": "function"
}]
//console.log("test1 :" + process.env.ALCHEMY_HTTP)
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ALCHEMY_HTTP))
const contract = new web3.eth.Contract(abi,'0x2F35783908cBda09e715608824D097fe2b50a4df')
const _projectId = process.env.PROJECT_ID
const tokenURL = process.env.TOKEN_URL;
const _Name = process.env.BUCKET_NAME
const _cre = process.env.KEY.replace(/\s+/g, '')
const _cre2 = _cre.replace(/\\n/g, '\n')
const storage = new Storage({ 
    client_email: process.env.EMAIL
    credentials: _cre2
})
const bucket = storage.bucket(_Name);
console.log(_cre2)
const app = express()

app.get('/watch',async(req, res) => {
    const _reqdata = req;
    const { db } = await connectToDatabase();
    let _obj = await db.collection("count").find({},{totalSupply:1}).toArray();
    const _totalSpully = parseInt(_obj[0].totalSupply,10);
    const _dbId = _obj[0]._id;
    //console.log(storage)
    const _totalsupply = await contract.methods.totalSupply().call();
    let _getData;

    //if(_totalSpully < _totalsupply){
        const tokenTx = await fetch(tokenURL);
        const tokenData = await tokenTx.json();
        const tokenDataArray = tokenData.result;
        let _array = await db.collection("array").find({},{array:1}).toArray();
        let _arrayId = _array[0]._id;
        let result = await tokenDataArray.filter(itemA => 
            _array[0].array.indexOf(itemA) == -1
        );
        console.log("get array etherscan : " + result.length)
        await result.map(async(item,index) => {
            
            const [files] = await bucket.getFiles({prefix:`data/${item.tokenID}.json`})
            console.log("get item : " + item.tokenID + " " + files)
            if(files.length > 0){
                console.log("1" + item.tokenID);
            }else{
                console.log("0" + item.tokenID);
            }
        })

        _getData = tokenDataArray.length;
        const result1 = await db.collection("count").updateOne({
            _id: _dbId
        }, {
            $set: {
                'totalSupply': _totalsupply
            },
        })
    //}
    res.send(_totalsupply + ' : ' + _getData + ' : ' + 'watch OpneVox!')
})

app.get('/',async(req, res) => {
    console.log("watching Now!")
    res.send('watching Now!')
})
app.listen(process.env.PORT || 3000)