// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

contract EctoTreasury is Ownable, Pausable {

    event Deposit(
        address indexed user,
        uint256 amount,
        uint256 timestamp,
        uint256 chainId
    );

    error InvalidDeposit();

    constructor() 
        Ownable(msg.sender) {
        
    }

    function deposit() external payable {

        if (msg.value<=0) revert InvalidDeposit();

        emit Deposit(
            msg.sender,
            msg.value,
            block.timestamp,
            block.chainid
        );


    }

    function withdraw(
        address payable to,
        uint256 amount
    ) external onlyOwner {


        require(
            amount <= address(this).balance,
            "Insufficient balance"
        );

        to.transfer(amount);

    }

    function balance()
        external
        view
        returns (uint256)
    {
        return address(this).balance;
    }
}