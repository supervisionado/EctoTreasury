// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.6.0
pragma solidity ^0.8.33;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract AnyToken is ERC20 {
    constructor(address recipient) ERC20("AnyToken", "ANY") {
        _mint(recipient, 1000000 * 10 ** decimals());
    }
}