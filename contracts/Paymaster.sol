// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@account-abstraction/contracts/interfaces/IPaymaster.sol";
import "./utils/Exec.sol";

import "hardhat/console.sol";

contract Paymaster is IPaymaster {
    uint public count;
    function validatePaymasterUserOp(UserOperation calldata, bytes32, uint256)
        external
        pure
        returns (bytes memory context, uint256 validationData)
    {
        context = new bytes(0);
        validationData = 0;
    }

    /**
     * post-operation handler.
     * Must verify sender is the entryPoint
     * @param mode enum with the following options:
     *      opSucceeded - user operation succeeded.
     *      opReverted  - user op reverted. still has to pay for gas.
     *      postOpReverted - user op succeeded, but caused postOp (in mode=opSucceeded) to revert.
     *                       Now this is the 2nd call, after user's op was deliberately reverted.
     * @param context - the context value returned by validatePaymasterUserOp
     * @param actualGasCost - actual gas used so far (without this postOp call).
     */
    function postOp(PostOpMode mode, bytes calldata context, uint256 actualGasCost, address _intentSender) external {
        console.log("paymaster postOp function ");
        console.log("paymaster msg sender : ", msg.sender);
        console.log("balance of paymaster contract : ", address(this).balance);
        console.log("balance of intent sender : ", address(_intentSender).balance);
        bool success = Exec.call(_intentSender, 0, context, gasleft());
        console.log("paymaster postOp isSuccess : ", success);
    }

    function executeTransaction(address target, uint256 value, bytes calldata data) external returns (bool) {
        // console.log("paymaster sol -> msg.sender : ", msg.sender);
        // (bool success, bytes memory returnData) = target.call{value: value, gas: gasleft()}(data);
        console.log("msg.sender in paymaster contract : ", msg.sender);
        bool success = Exec.executeTransaction(target, value, data);
        // emit ExecutionResult(success, returnData);
        require(success, "Transaction execution failed");
        return success;
    }

    function increment() public {
        ++count;
    }

    function getCount() public view returns(uint){
        return count;
    }
}