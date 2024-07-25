import { TxFeeCalculator } from '../benchmark/feeCalculator';
import { MainnetCalculator } from '../benchmark/mainnet';
import { OPStackCalculator } from '../benchmark/opstack';
import { ArbitrumCalculator } from '../benchmark/arbitrum';
import { Environment, deployTestEnvironment } from '../scenarios/environment';
import { ScenarioOptions, ScenarioResult } from '../scenarios/scenario';
import { TokenSwapScenario } from '../scenarios/tokenSwapScenario';
import { TransferErc20Scenario } from '../scenarios/transferErc20Scenario';
import { TransferEthScenario } from '../scenarios/transferEthScenario';
import { ethers } from 'hardhat';

const MAX_INTENT_BATCH = 16;
const USE_TRANSIENT_DATA = true;
const MAINNET_BLOCK_GAS_LIMIT = 15_000_000n;
const GAS_PRICE = 38;
const ETH_PRICE = 2250;
const OP_GAS_PRICE = 0.004;
const OP_DATA_PRICE = 38;
const OP_DATA_SCALER = 0.684;
const ARB_GAS_PRICE = 0.004;
const ARB_DATA_PRICE = 30;

async function main() {
    console.log('ASSUMED PARAMETERS');
  
    const [signer0, signer1] = await ethers.getSigners();
    console.log("bal before deployment : ", await ethers.provider.getBalance(signer0.address));
  
    console.log('DEPLOYMENT');
    const env = await deployTestEnvironment({ numAccounts: MAX_INTENT_BATCH, useTransientData: USE_TRANSIENT_DATA });
  
    console.log("bal after deployment : ", await ethers.provider.getBalance(signer0.address));
  
    console.log('SCENARIOS');
    const transferErc20 = new TransferErc20Scenario(env);
    await transferErc20.init();
    await transferErc20.run(16);
    // const transferErc20Base = await transferErc20.runBaseline();
}

main();