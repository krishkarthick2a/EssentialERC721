const {ethers} = require("hardhat");

async function main(){
    const paymaster = await ethers.deployContract("Paymaster");
    await paymaster.waitForDeployment();
    console.log("paymaster contract deployed at : ", paymaster.target);
}

main();