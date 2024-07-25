const { log } = require("console");
const {ethers} = require("hardhat");
const {UserIntent} = require("./intent.js");

let testContractAddress;
let signer0, signer1;

// Simulated function for a solver
async function createIntentSolution(userIntents) {

    const sender = signer0.address

    const t = await ethers.deployContract("Test");
    await t.waitForDeployment();
    console.log("test deployed at : ", t.target)

    const test = await ethers.getContractFactory("Test");
    const data = test.interface.encodeFunctionData("incrementCount");

    // Create UserIntent object
    const userIntent = {
        sender: t.target,
        intentData: [data], 
        signature: '0xsignature' 
    };

    // console.log("user intent data : ", userIntent);

    return userIntent;
}

// Simulated function to submit IntentSolution
async function submitIntentSolution(intentSolution) {
    try {
        const entryPointAddress = testContractAddress; // Replace with actual address
        
        const entryPointABI = [
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "intIndex",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "segIndex",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "reason",
                  "type": "string"
                }
              ],
              "name": "FailedIntent",
              "type": "error"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "intentHash",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "submitter",
                  "type": "address"
                }
              ],
              "name": "UserIntentEvent",
              "type": "event"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "standardId",
                  "type": "bytes32"
                }
              ],
              "name": "getIntentStandardContract",
              "outputs": [
                {
                  "internalType": "contract IIntentStandard",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "contract IIntentStandard",
                  "name": "intentStandard",
                  "type": "address"
                }
              ],
              "name": "getIntentStandardId",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "key",
                  "type": "uint256"
                }
              ],
              "name": "getNonce",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "nonce",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "components": [
                    {
                      "internalType": "address",
                      "name": "sender",
                      "type": "address"
                    },
                    {
                      "internalType": "bytes[]",
                      "name": "segments",
                      "type": "bytes[]"
                    },
                    {
                      "internalType": "bytes",
                      "name": "signature",
                      "type": "bytes"
                    }
                  ],
                  "internalType": "struct UserIntent",
                  "name": "intent",
                  "type": "tuple"
                }
              ],
              "name": "getUserIntentHash",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "timestamp",
                      "type": "uint256"
                    },
                    {
                      "components": [
                        {
                          "internalType": "address",
                          "name": "sender",
                          "type": "address"
                        },
                        {
                          "internalType": "bytes[]",
                          "name": "segments",
                          "type": "bytes[]"
                        },
                        {
                          "internalType": "bytes",
                          "name": "signature",
                          "type": "bytes"
                        }
                      ],
                      "internalType": "struct UserIntent[]",
                      "name": "intents",
                      "type": "tuple[]"
                    },
                    {
                      "internalType": "uint256[]",
                      "name": "order",
                      "type": "uint256[]"
                    }
                  ],
                  "internalType": "struct IntentSolution",
                  "name": "solution",
                  "type": "tuple"
                }
              ],
              "name": "handleIntents",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "timestamp",
                      "type": "uint256"
                    },
                    {
                      "components": [
                        {
                          "internalType": "address",
                          "name": "sender",
                          "type": "address"
                        },
                        {
                          "internalType": "bytes[]",
                          "name": "segments",
                          "type": "bytes[]"
                        },
                        {
                          "internalType": "bytes",
                          "name": "signature",
                          "type": "bytes"
                        }
                      ],
                      "internalType": "struct UserIntent[]",
                      "name": "intents",
                      "type": "tuple[]"
                    },
                    {
                      "internalType": "uint256[]",
                      "name": "order",
                      "type": "uint256[]"
                    }
                  ],
                  "internalType": "struct IntentSolution[]",
                  "name": "solutions",
                  "type": "tuple[]"
                }
              ],
              "name": "handleIntentsMulti",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "contract IIntentStandard",
                  "name": "intentStandard",
                  "type": "address"
                }
              ],
              "name": "registerIntentStandard",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "erc20Contract",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "from",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "releaseErc20",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "releaseEth",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "key",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "nonce",
                  "type": "uint256"
                }
              ],
              "name": "setNonce",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "interfaceId",
                  "type": "bytes4"
                }
              ],
              "name": "supportsInterface",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "components": [
                    {
                      "internalType": "address",
                      "name": "sender",
                      "type": "address"
                    },
                    {
                      "internalType": "bytes[]",
                      "name": "segments",
                      "type": "bytes[]"
                    },
                    {
                      "internalType": "bytes",
                      "name": "signature",
                      "type": "bytes"
                    }
                  ],
                  "internalType": "struct UserIntent",
                  "name": "intent",
                  "type": "tuple"
                }
              ],
              "name": "validateIntent",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "contract IIntentStandard",
                  "name": "intentStandard",
                  "type": "address"
                }
              ],
              "name": "verifyExecutingIntentSegmentForStandard",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            }
        ]; 
        wallet = signer0;
        
        const entryPointContract = await ethers.getContractAt("EntryPoint", entryPointAddress)
        console.log("ep interface  :", await entryPointContract.getAddress());

        console.log("intent solution : ", intentSolution);
        // const tx = await entryPointContract.handleIntents(intentSolution);
        // await tx.wait();

        console.log('IntentSolution submitted:', tx.hash);
    } catch (error) {
        console.error('Error submitting IntentSolution:', error);
    }
}

async function generateIntent(account) {
  const intent = new UserIntent(account.contractAddress);
  intent.addSegment(env.standards.sequentialNonce(await env.utils.getNonce(account.contractAddress)));
  intent.addSegment(env.standards.ethRecord(false));
  intent.addSegment(env.standards.ethRequire(new ConstantCurve(123n, true, false)));

  return intent;
}

// Example usage
async function main() {
    [signer0, signer1] = await ethers.getSigners();

    const ep = await ethers.deployContract("EntryPoint");
    await ep.waitForDeployment();
    testContractAddress = ep.target;
    console.log("entry point deployed at : ", testContractAddress);

    const baseAccount = await ethers.deployContract("SimpleAccountFactory", [ep.target]);
    await baseAccount.waitForDeployment();
    console.log("base account : ", baseAccount.target);

    const smartAccount = await baseAccount.createAccount(signer0.address, 111);
    // console.log("smart account : ", smartAccount);
    let smartContractAddress = await baseAccount.getAddress(signer0.address, 111)
    console.log("get smart account : ",await baseAccount.getAddress(signer0.address, 111));
    await baseAccount.createAccount(signer1.address, 1);
    smartContractAddress = await baseAccount.getAddress(signer1.address, 111)
    console.log("get smart account : ",await baseAccount.getAddress(signer0.address, 222));

    //to if the address is smart account
    const addr = await ethers.provider.getCode(signer0.address);
    console.log("getCode : ", addr);

    //create randome smart account using random address
    for (let i = 0; i < 5; i++) {
      const provider = ethers.provider;
      const signer = new ethers.Wallet(ethers.hexlify(ethers.randomBytes(32))).connect(provider);
      const signerAddress = await signer.getAddress();
  
      await baseAccount.createAccount(signerAddress, i);
      const contractAddress = await baseAccount.getFunction('getAddress(address,uint256)')(signerAddress, i);
      console.log(`signer : ${signerAddress} , smart address : ${contractAddress}`);
      const addr = await ethers.provider.getCode(contractAddress);
      console.log("getCode : ", addr);
      const contract = await ethers.getContractAt('SimpleAccount', contractAddress);
      // console.log("contract : ", contract.target);
  
      // await deployer.sendTransaction({ to: signerAddress, value: fundAmount });
      // await testERC20.connect(signer).approve(contractAddress, ethers.MaxUint256);
      // await testWrappedNativeToken.connect(signer).approve(contractAddress, ethers.MaxUint256);
  
      // eoaProxyAccounts.push({ contract, contractAddress, signer, signerAddress });
    }

    const paymasteAddress = "0x4ff1f64683785E0460c24A4EF78D582C2488704f";
    const paymaster = await ethers.getContractAt("Paymaster", paymasteAddress);
    await ep.executeTransaction(paymasteAddress, 0, paymaster.interface.encodeFunctionData("increment"));
    await ep.executeTransaction(paymasteAddress, 0, paymaster.interface.encodeFunctionData("increment"));
    
    const count = await paymaster.getCount();
    console.log("get count in paymaster : ", count);


  // console.log(await ethers.provider.getCode(await baseAccount.connect(signer1.address).getAddress(signer1.address, 111)));

    try {
        const userIntents = []; // Simulated userIntents fetched by the solver

        // const intentSolution = await createIntentSolution(userIntents);
        const intent =  new UserIntent(smartContractAddress);
        // console.log("intent : ", intent);
        


        console.log('Process completed successfully!');
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
