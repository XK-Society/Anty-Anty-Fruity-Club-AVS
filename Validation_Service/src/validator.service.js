require('dotenv').config();
const dalService = require("./dal.service");
const oracleService = require("./oracle.service");

// Default coin from environment variable or fallback to "eth"
const DEFAULT_COIN = process.env.DEFAULT_COIN || "eth";

async function validate(proofOfTask) {
  try {
      const taskResult = await dalService.getIPfsTask(proofOfTask);
      
      // Get the coin from the task result or use default
      const coin = taskResult.coin || DEFAULT_COIN;
      
      const currentFee = await oracleService.getFee(coin);
      const upperBound = currentFee * 1.05;
      const lowerBound = currentFee * 0.95;
      
      let isApproved = true;
      if (taskResult.fee > upperBound || taskResult.fee < lowerBound) {
        isApproved = false;
      }
      
      console.log(`Validation for ${coin}: Result=${isApproved ? 'Approved' : 'Rejected'}, Bounds: [${lowerBound.toFixed(4)}-${upperBound.toFixed(4)}], Got: ${taskResult.fee.toFixed(4)}`);
      
      return isApproved;
    } catch (err) {
      console.error(err?.message);
      return false;
    }
  }
  
  module.exports = {
    validate,
  }