const { ethers } = require('hardhat');
const {
  SimpleAccount,
  BLSAccount,
  BLSSignatureAggregator,
  EntryPoint,
  SolverUtils,
  TestERC20,
  TestUniswap,
  TestWrappedNativeToken,
  TransientDataAccount,
} = require('../../typechain');
const { Curve } = require('../library/curveCoder');
const { SimpleCallSegment } = require('../library/standards/simpleCall');
const { UserOperationSegment } = require('../library/standards/userOperation');
const { SequentialNonceSegment } = require('../library/standards/sequentialNonce');
const { EthRecordSegment } = require('../library/standards/ethRecord');
const { EthReleaseSegment } = require('../library/standards/ethRelease');
const { EthRequireSegment } = require('../library/standards/ethRequire');
const { Erc20RecordSegment } = require('../library/standards/erc20Record');
const { Erc20ReleaseSegment } = require('../library/standards/erc20Release');
const { Erc20RequireSegment } = require('../library/standards/erc20Require');
const { BlsSigner, BlsSignerFactory, BlsVerifier } = require('../library/bls/bls');
const { CalldataCompression } = require('../library/compression/calldataCompression');
const { deployGeneralStaticRegistry, splitDictionary } = require('../library/compression/generalStaticRegistry');
const { deployGeneralCalldataCompression } = require('../library/compression/generalCalldataCompression');

// Deploy the testing environment
async function deployTestEnvironment(config = { numAccounts: 4, useTransientData: true }) {
  const provider = ethers.provider;
  const network = await provider.getNetwork();
  const signers = await ethers.getSigners();
  const deployer = signers[0];

  // Deploy the entrypoint contract and register intent standards
  const entrypoint = await ethers.deployContract('EntryPoint', [], deployer);
  const entrypointAddress = await entrypoint.getAddress();
  const callStdId = '0x0000000000000000000000000000000000000000000000000000000000000000';
  const erc20RecordStdId = '0x0000000000000000000000000000000000000000000000000000000000000001';
  const erc20ReleaseStdId = '0x0000000000000000000000000000000000000000000000000000000000000002';
  const erc20RequireStdId = '0x0000000000000000000000000000000000000000000000000000000000000003';
  const ethRecordStdId = '0x0000000000000000000000000000000000000000000000000000000000000004';
  const ethReleaseStdId = '0x0000000000000000000000000000000000000000000000000000000000000005';
  const ethRequireStdId = '0x0000000000000000000000000000000000000000000000000000000000000006';
  const sequentialNonceStdId = '0x0000000000000000000000000000000000000000000000000000000000000007';
  const userOperationStdId = '0x0000000000000000000000000000000000000000000000000000000000000008';
  const entrypointGasUsed = (await entrypoint.deploymentTransaction().wait()).gasUsed || 0n;

  // Register intent standards
  const erc20Record = await registerIntentStandard('Erc20Record', entrypoint, deployer);
  const erc20Release = await registerIntentStandard('Erc20Release', entrypoint, deployer);
  const erc20Require = await registerIntentStandard('Erc20Require', entrypoint, deployer);
  const ethRecord = await registerIntentStandard('EthRecord', entrypoint, deployer);
  const ethRelease = await registerIntentStandard('EthRelease', entrypoint, deployer);
  const ethRequire = await registerIntentStandard('EthRequire', entrypoint, deployer);
  const sequentialNonce = await registerIntentStandard('SequentialNonce', entrypoint, deployer);
  const simpleCall = await registerIntentStandard('SimpleCall', entrypoint, deployer);
  const userOperation = await registerIntentStandard('UserOperation', entrypoint, deployer);
  const registerStandardGasUsed =
    (erc20Record.gasUsed +
      erc20Release.gasUsed +
      erc20Require.gasUsed +
      ethRecord.gasUsed +
      ethRelease.gasUsed +
      ethRequire.gasUsed +
      sequentialNonce.gasUsed +
      simpleCall.gasUsed +
      userOperation.gasUsed) /
    9n;

  // Deploy misc test contracts
  const testERC20 = await ethers.deployContract('TestERC20', [], deployer);
  const testERC20Address = await testERC20.getAddress();
  const testWrappedNativeToken = await ethers.deployContract('TestWrappedNativeToken', [], deployer);
  const testWrappedNativeTokenAddress = await testWrappedNativeToken.getAddress();
  const testUniswap = await ethers.deployContract('TestUniswap', [testWrappedNativeTokenAddress], deployer);
  const testUniswapAddress = await testUniswap.getAddress();
  const solverUtils = await ethers.deployContract(
    'SolverUtils',
    [testUniswapAddress, testERC20Address, testWrappedNativeTokenAddress],
    deployer,
  );
  const solverUtilsAddress = await solverUtils.getAddress();

  // Deploy signature aggregation contracts
  const blsSignatureAggregator = await ethers.deployContract('BLSSignatureAggregator', [entrypointAddress], deployer);
  const blsSignatureAggregatorAddress = await blsSignatureAggregator.getAddress();
  const blsSignatureAggregatorGasUsed = (await blsSignatureAggregator.deploymentTransaction().wait()).gasUsed || 0n;

  // Deploy smart contract wallet factories
  const simpleAccountFactory = await ethers.deployContract('SimpleAccountFactory', [entrypointAddress], deployer);
  const simpleAccountFactoryGasUsed = (await simpleAccountFactory.deploymentTransaction().wait()).gasUsed || 0n;
  const transientDataAccountFactory = await ethers.deployContract('TransientDataAccountFactory', [], deployer);
  const blsAccountFactory = await ethers.deployContract(
    'BLSAccountFactory',
    [entrypointAddress, blsSignatureAggregatorAddress],
    deployer,
  );

  // Deploy smart contract wallets
  const fundAmount = ethers.parseEther('1');
  let simpleAccountGasUsed = 0n;
  const simpleAccounts = [];
  for (let i = 0; i < config.numAccounts; i++) {
    const signer = new ethers.Wallet(ethers.hexlify(ethers.randomBytes(32)));
    const signerAddress = await signer.getAddress();

    let createAccountReceipt = null;
    let contractAddress = '';
    let contract = null;
    if (config.useTransientData) {
      createAccountReceipt = await (await transientDataAccountFactory.createAccount(signerAddress, i)).wait();
      contractAddress = await transientDataAccountFactory.getAddress(signerAddress, i);
      contract = await ethers.getContractAt('TransientDataAccount', contractAddress, deployer);
    } else {
      createAccountReceipt = await (await simpleAccountFactory.createAccount(signerAddress, i)).wait();
      contractAddress = await simpleAccountFactory.getAddress(signerAddress, i);
      contract = await ethers.getContractAt('SimpleAccount', contractAddress, deployer);
    }

    await deployer.sendTransaction({ to: contractAddress, value: fundAmount });

    simpleAccounts.push({ contract, contractAddress, signer, signerAddress });
    simpleAccountGasUsed += createAccountReceipt.gasUsed || 0n;
  }
  simpleAccountGasUsed /= BigInt(config.numAccounts);

  // Deploy smart contract wallets intended to serve as proxies for an EOA
  const eoaProxyAccounts = [];
  for (let i = 0; i < config.numAccounts; i++) {
    const signer = new ethers.Wallet(ethers.hexlify(ethers.randomBytes(32))).connect(provider);
    const signerAddress = await signer.getAddress();

    await simpleAccountFactory.createAccount(signerAddress, i);
    const contractAddress = await simpleAccountFactory.getAddress(signerAddress, i);
    const contract = await ethers.getContractAt('SimpleAccount', contractAddress, deployer);

    await deployer.sendTransaction({ to: signerAddress, value: fundAmount });
    await testERC20.connect(signer).approve(contractAddress, ethers.MaxUint256);
    await testWrappedNativeToken.connect(signer).approve(contractAddress, ethers.MaxUint256);

    eoaProxyAccounts.push({ contract, contractAddress, signer, signerAddress });
  }

  // Deploy smart contract wallets intended to serve as proxies for an EOA
  const BLS_DOMAIN = ethers.toBeArray(ethers.keccak256(Buffer.from('erc7521.bls.domain')));
  const blsSignerFactory = await BlsSignerFactory.new(BLS_DOMAIN);
  const blsVerifier = new BlsVerifier(BLS_DOMAIN);
  const blsAccounts = [];
  for (let i = 0; i < config.numAccounts; i++) {
    const owner = new ethers.Wallet(ethers.hexlify(ethers.randomBytes(32))).connect(provider);
    const ownerAddress = await owner.getAddress();

    const signer = blsSignerFactory.createSigner(`0x${(i + 10).toString(16).padStart(64, '0')}`);
    const publicKey = signer.pubkey;
    const blsAddress = await blsAccountFactory.getAccountAddress(publicKey, 0);
    await (await blsAccountFactory.createAccount(publicKey, 0)).wait();
    const blsAccount = await ethers.getContractAt('BLSAccount', blsAddress);

    await deployer.sendTransaction({ to: blsAddress, value: fundAmount });

    blsAccounts.push({ contract: blsAccount, contractAddress: blsAddress, owner, ownerAddress, publicKey, signer });
  }

  // Deploy static registry
  const dictionary = splitDictionary('system ./ ./', 100, 10);
  const staticRegistry = await deployGeneralStaticRegistry(deployer, dictionary);

  // Deploy calldata compression
  const calldataCompression = await deployGeneralCalldataCompression(deployer, dictionary);
  const calldataCompressionAddress = await calldataCompression.getAddress();

  return {
    deployer,
    entrypoint,
    entrypointGasUsed,
    registerStandardGasUsed,
    blsSignatureAggregator,
    blsSignatureAggregatorGasUsed,
    simpleAccountFactory,
    simpleAccountFactoryGasUsed,
    simpleAccounts,
    eoaProxyAccounts,
    blsAccounts,
    staticRegistry,
    calldataCompression,
    calldataCompressionAddress,
    testERC20,
    testERC20Address,
    testUniswap,
    testUniswapAddress,
    testWrappedNativeToken,
    testWrappedNativeTokenAddress,
    solverUtils,
    solverUtilsAddress,
    contracts: {
      entrypoint,
      blsSignatureAggregator,
      simpleAccountFactory,
      blsAccountFactory,
      testERC20,
      testUniswap,
      testWrappedNativeToken,
      solverUtils,
    },
    standards: {
      ethRecord: proxy => new EthRecordSegment(ethRecordStdId, proxy),
      ethRelease: (proxy, curve) => new EthReleaseSegment(ethReleaseStdId, proxy, curve),
      ethRequire: (proxy, curve) => new EthRequireSegment(ethRequireStdId, proxy, curve),
      erc20Record: (contract, proxy) => new Erc20RecordSegment(erc20RecordStdId, contract, proxy),
      erc20Release: (contract, curve) => new Erc20ReleaseSegment(erc20ReleaseStdId, contract, curve),
      erc20Require: (contract, curve) => new Erc20RequireSegment(erc20RequireStdId, contract, curve),
    },
    registeredStandards: {
      call: callData => new SimpleCallSegment(callStdId, callData),
      userOp: (callData, gasLimit) => new UserOperationSegment(userOperationStdId, callData, gasLimit),
      sequentialNonce: nonce => new SequentialNonceSegment(sequentialNonceStdId, nonce),
      ethRecord: proxy => new EthRecordSegment(ethRecordStdId, proxy),
    },
  };
}

async function registerIntentStandard(name, entrypoint, deployer) {
  const tx = await entrypoint.registerStandard(name, deployer);
  const receipt = await tx.wait();
  return { gasUsed: receipt.gasUsed || 0n };
}

module.exports = { deployTestEnvironment };
