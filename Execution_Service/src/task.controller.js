"use strict";
const oracleService = require("./oracle.service");
const dalService = require("./dal.service");

// Default coin from environment variable or fallback to "eth"
const DEFAULT_COIN = process.env.DEFAULT_COIN || "eth";

async function executeTask(coin = DEFAULT_COIN) {
    console.log(`Executing task for ${coin}...`);
    try {
        const result = await oracleService.getFee(coin);
        const cid = await dalService.publishJSONToIpfs({
            coin: coin,
            fee: result,
            timestamp: Date.now()
        });
        const data = Math.floor(result * 1e6);
        await dalService.sendTask(cid, data, 0);
    } catch (error) {
        console.log(error)
    }
}

function start() {
    setTimeout(() => {
        executeTask(); 

        setInterval(() => {
            executeTask(); 
        }, 60 * 60 * 1000); 
    }, 10000); 
}

// Export additional function to allow executing tasks for specific coins
module.exports = { 
    start,
    executeTask
};