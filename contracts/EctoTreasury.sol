// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/* 

    Planned supported ERC-20 tokens on Ethereum blockchain:
    USDT: 0xdAC17F958D2ee523a2206206994597C13D831ec7
    USDC: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48

    Planned supported ERC-20 tokens on Sonic blockchain:
      USDC: 0x29219dd400f2Bf60E5a23d13Be72B486D4038894
      USSD: 0x000000000eCcFf26B795F73fb0A70d48da657fEf  
    PHANIC: 0xB4F58eeAbE36711D72e99f35cbf36210561522bE

*/

contract EctoTreasury is Ownable, Pausable {

    using Address for address payable;
    using SafeERC20 for IERC20;

    mapping(address => bool) public allowedTokens;

    event Deposit(
        address indexed user,
        address indexed token,
        uint256 amount
    );

    error InvalidDeposit();
    error InsufficientTokenBalance();
    error InsufficientETHBalance();
    error InvalidAddress();
    error TokenNotAllowed();

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
    function deposit() external payable whenNotPaused {

        if (msg.value==0) revert InvalidDeposit();

        emit Deposit(
            msg.sender,
            address(0),
            msg.value
        );

    }

    // Accept direct native currency transfers and emit a Deposit event
    // so off-chain indexers can track them.
    receive() external payable whenNotPaused {
        
        if (msg.value == 0) revert InvalidDeposit();

        emit Deposit(
            msg.sender,
            address(0),
            msg.value
        );

    }    

    // Deposit any authorized token
    function depositToken(
        address token,
        uint256 amount
    ) external whenNotPaused
    {
        
        if (!allowedTokens[token]) revert TokenNotAllowed();
        if (amount==0) revert InvalidDeposit();

        // Check token balance before the transfer
        uint256 beforeBal = IERC20(token).balanceOf(address(this));

        IERC20(token).safeTransferFrom(
            msg.sender,
            address(this),
            amount
        );        

        // Get the delta: check token balance after the transfer, and substract
        uint256 received = IERC20(token).balanceOf(address(this)) - beforeBal; 

        emit Deposit(
                       msg.sender,
                       token,
                       received
                    ); 


    }    

    /// Allows the owner to withdraw some collected funds
    function withdrawEthTo(
        address to,
        uint256 amount
    ) external onlyOwner {

        if (to == address(0)) revert InvalidAddress();

        uint256 ethbalance = address(this).balance;
        if (amount > ethbalance) revert InsufficientETHBalance();

        payable(to).sendValue(amount);
    }

    /// Allows the owner to withdraw ALL collected funds 
    function withdrawAllEthTo(address addTo) external onlyOwner {

        if (addTo == address(0)) revert InvalidAddress();   

        uint256 ethbalance = address(this).balance;
        if (ethbalance==0) revert InsufficientETHBalance();

        payable(addTo).sendValue(ethbalance);

    }     

    /// Allows the owner to withdraw some collected tokens
    function withdrawTokenTo(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner {

        if (to == address(0)) revert InvalidAddress();
        if (!allowedTokens[token]) revert TokenNotAllowed();        

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
        if (!allowedTokens[token]) revert TokenNotAllowed();

        uint256 tbalance =
            IERC20(token)
                .balanceOf(address(this));

        if (tbalance==0) revert InsufficientTokenBalance();                

        IERC20(token)
            .safeTransfer(
                to,
                tbalance
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
        if (!allowedTokens[token]) revert TokenNotAllowed();
        return IERC20(token)
            .balanceOf(address(this));
    }

    /// Pause contract activity
    function pause() external onlyOwner {
        _pause();
    }

    /// Unpause contract activity
    function unpause() external onlyOwner {
        _unpause();
    }


}