const { ethers } = require('ethers');

// The intent object
class UserIntent {
  constructor(sender) {
    if (sender) this.validateSender(sender);
    this.sender = sender || '0x0000000000000000000000000000000000000000';
    this.segments = [];
    this.signature = '0x';
  }

  // Set the sender of the intent (smart contract account contract address)
  setSender(sender) {
    this.validateSender(sender);
    this.sender = sender;
  }

  // Add a segment to the intent
  addSegment(segment) {
    this.segments.push(segment);
  }

  // Gets the segment of the intent at the specified index
  getSegment(index) {
    return this.segments[index];
  }

  // Clear all intent segments
  clearSegments() {
    this.segments = [];
  }

  // Sign the intent with the ECDSA signer authorized by the intent sender
  async sign(chainId, entrypoint, signer) {
    const hash = ethers.arrayify(this.hash(chainId, entrypoint));
    this.signature = await signer.signMessage(hash);
    return this.signature;
  }

  // Manually sets the signature field if account using signature scheme other than ECDSA
  async setSignature(signature) {
    this.signature = signature;
  }

  // Gets the hash of the intent
  hash(chainId, entrypoint) {
    const abi = new ethers.AbiCoder();
    const segments = this.segments.map(segment => segment.asBytes());
    const segmentsHash = ethers.keccak256(abi.encode(['bytes[]'], [segments]));
    const intentHash = ethers.keccak256(abi.encode(['address', 'bytes32'], [this.sender, segmentsHash]));
    const hash = ethers.keccak256(abi.encode(['bytes32', 'address', 'uint256'], [intentHash, entrypoint, chainId]));
    return ethers.hexZeroPad(hash, 32);
  }

  // Gets the intent object with segment data encoded
  asUserIntentStruct() {
    const segments = this.segments.map(segment => segment.asBytes());
    return {
      sender: this.sender,
      segments,
      signature: this.signature,
    };
  }

  // Validation functions
  validateSender(sender) {
    if (!ethers.isAddress(sender)) throw new Error(`sender is not a valid address (sender: ${sender})`);
  }
}

// The intent segment object
class IntentSegment {
  // Gets the bytes ABI encoding of the segment
  asBytes() {
    throw new Error('Method not implemented');
  }
}

// Intent solution builder helper function
function buildSolution(timestamp, intents, order) {
  const intentStructs = intents.map(userIntent => userIntent.asUserIntentStruct());
  return {
    timestamp,
    intents: intentStructs,
    order,
  };
}

module.exports = {
  UserIntent,
  IntentSegment,
  buildSolution,
};
