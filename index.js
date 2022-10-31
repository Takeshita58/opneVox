const express = require('express')
const Web3 = require('web3')
require('dotenv').config();
const connectToDatabase = require('mongodb');

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

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ALCHEMY_HTTP))
const contract = new web3.eth.Contract(abi,'0x2F35783908cBda09e715608824D097fe2b50a4df')
/*const { db } = await connectToDatabase();
let _obj = await db.collection("count").find({ totalsupply: _address}).toArray();*/
const app = express()
app.get('/watch',async(req, res) => {
    console.log("watch OpneVox!")
    const _totalsupply = await contract.methods.totalSupply().call();
    res.send(_totalsupply + ' : ' + 'watch OpneVox!')
})
app.listen(process.env.PORT || 3000)