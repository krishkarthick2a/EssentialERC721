// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

contract Test{
    address public owner;
    uint public count;

    constructor(){
        owner = msg.sender;
    }

    function getOwner() public view returns(address){
        owner;
    }

    function incrementCount() public {
        ++count;
    }
}