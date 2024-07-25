// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "hardhat/console.sol";

// solhint-disable no-inline-assembly

/**
 * Utility functions helpful when making different kinds of contract calls in Solidity.
 */
library Exec {
    // helpful constants
    uint256 public constant REVERT_REASON_MAX_LEN = 2048;
    uint256 public constant REVERT_REASON_START_OFFSET = 0x44;

    // make a low level call
    function call(address to, uint256 value, bytes memory data, uint256 txGas) internal returns (bool success) {
        console.log("library to : ", to);
        console.log("library entry contract : 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" );
        console.log("library msg. sender : ", msg.sender);
        console.log("balance of msg.sender : ", msg.sender.balance);

        assembly {
            // success = true;
            success := call(txGas, to, value, add(data, 0x20), mload(data), 0, 0)
        }
    }

    // make a low level static call
    function staticcall(address to, bytes memory data, uint256 txGas) internal view returns (bool success) {
        console.log("library staticcall ");
        assembly {
            success := staticcall(txGas, /*0x6b91318da72D33CaD5f71502101bCD7563068dFe*/ to, add(data, 0x20), mload(data), 0, 0)
        }
    }

    // make a low level delegate call
    function delegateCall(address to, bytes memory data, uint256 txGas) internal returns (bool success) {
        console.log("library delegate call() msg.sender : ", msg.sender);
        assembly {
            success := delegatecall(txGas, to, add(data, 0x20), mload(data), 0, 0)
        }
    }

    // get returned data size from last call or calldelegate
    function getReturnDataSize() internal pure returns (uint256 size) {
        assembly {
            size := returndatasize()
        }
    }

    // get returned data from last call
    function getReturnData(uint256 offset, uint256 maxLen) internal pure returns (bytes memory returnData) {
        assembly {
            let len := returndatasize()
            if gt(len, offset) {
                len := sub(len, offset)
                if gt(len, maxLen) { len := maxLen }
                let ptr := mload(0x40)
                mstore(0x40, add(ptr, add(len, 0x20)))
                mstore(ptr, len)
                returndatacopy(add(ptr, 0x20), offset, len)
                returnData := ptr
            }
        }
    }

    // revert with the same returned data from the last call
    function forwardRevert(uint256 maxLen) internal pure {
        bytes memory returnData = getReturnData(0, maxLen);
        assembly {
            revert(add(returnData, 32), mload(returnData))
        }
    }

    function executeTransaction(address target, uint256 value, bytes calldata data) internal returns (bool) {
        console.log("paymaster sol -> msg.sender : ", msg.sender);
        (bool success, bytes memory returnData) = target.call{value: value, gas: gasleft()}(data);
        // emit ExecutionResult(success, returnData);
        require(success, "Transaction execution failed");
        return success;
    }
}

library RevertReason {
    // remove the trailing paddings from a revert reason
    function revertReasonWithoutPadding(bytes memory data) internal pure returns (bytes memory) {
        uint256 paddingStartIndex = data.length - 1;
        while (data[paddingStartIndex] == 0) {
            paddingStartIndex = paddingStartIndex - 1;
        }

        bytes memory reason = new bytes(paddingStartIndex + 1);

        for (uint256 i = 0; i <= paddingStartIndex; i++) {
            reason[i] = data[i];
        }
        return reason;
    }
}
