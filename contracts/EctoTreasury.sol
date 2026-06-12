// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

using SafeERC20 for IERC20;

contract EctoTreasury is Ownable, Pausable, ReentrancyGuard {

    using Address for address payable;
    using SafeERC20 for IERC20;

    mapping(address => bool) public allowedTokens;

    event Deposit(
        address indexed user,
        uint256 amount,
        uint256 timestamp,
        uint256 chainId
    );

    event TokenDeposit(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 timestamp,
        uint256 chainId
    );

    error InvalidDeposit();
    error InsufficientBalance();
    error InvalidAddress();

    constructor() 
        Ownable(msg.sender) {
    }

    // Change allowance state on token contract
    function setAllowedToken(
    address token,
    bool allowed
    ) external onlyOwner
    {
        allowedTokens[token] = allowed;
    }

    // Deposit native ETH
    function deposit() external payable nonReentrant {

        if (msg.value<=0) revert InvalidDeposit();

        emit Deposit(
            msg.sender,
            msg.value,
            block.timestamp,
            block.chainid
        );


    }

    // Deposit any authorized token
    function depositToken(
        address token,
        uint256 amount
    ) external
    {
        require(
            allowedTokens[token],
            "Token not allowed"
        );

        require(
            amount > 0,
            "Zero amount"
        );

        IERC20(token).transferFrom(
            msg.sender,
            address(this),
            amount
        );

        emit TokenDeposit(
            msg.sender,
            token,
            amount,
            block.timestamp,
            block.chainid
        );
    }    

    /// Allows the owner to withdraw some collected funds
    function withdrawTo(
        address to,
        uint256 amount
    ) external nonReentrant onlyOwner {

        uint256 balance = address(this).balance;
        if (amount >= balance) revert InsufficientBalance();

        payable(to).sendValue(balance);
    }

    /// Allows the owner to withdraw ALL collected funds 
    function withdrawAllTo(address addTo) external nonReentrant onlyOwner {

        if (addTo == address(0)) revert();        
        uint256 balance = address(this).balance;

        if (balance==0) revert InsufficientBalance();

        payable(addTo).sendValue(balance);

    }     

    /// Allows the owner to withdraw some collected tokens
    function withdrawTokenTo(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner {

        if (to == address(0)) revert InvalidAddress();

        IERC20(token).safeTransfer(
            to,
            amount
        );

    }      

    /// Allows the owner to withdraw ALL collected funds on specific token
    function withdrawAllTokenTo(
        address token,
        address to
    )
        external
        onlyOwner
    {

        if (to == address(0)) revert InvalidAddress();

        uint256 balance =
            IERC20(token)
                .balanceOf(address(this));

        if (balance==0) revert InsufficientBalance();                

        IERC20(token)
            .safeTransfer(
                to,
                balance
            );

    }

    // Get balance of native ETH
    function balance()
        external
        view
        returns (uint256)
    {
        return address(this).balance;
    }

    // Get balance of ERC-20 token
    function tokenBalance(
    address token
    )
        external
        view
        returns (uint256)
    {
        return IERC20(token)
            .balanceOf(address(this));
    }
}