import { expect } from "chai";
import { ZeroAddress } from "ethers";
import { network } from "hardhat";
import hre from "hardhat";

const { ethers } = await hre.network.create();

describe("EctoTreasury unit test", function () {

  // Define a fixture that deploys your contracts and returns whatever you need
  async function deployFixture() {

    const [owner, otherAcc] = await ethers.getSigners(); 

    const anytoken = await ethers.getContractFactory("AnyToken");
    const at = await anytoken.deploy(owner.address);
    await at.waitForDeployment();      

    const ETContract = await ethers.getContractFactory("EctoTreasury");
    const et = await ETContract.deploy();
    await et.waitForDeployment();

    return { at, et, owner, otherAcc };
  }

  it("Should get zero balance on contract", async function () {
    
    const { networkHelpers } = await hre.network.create();
    const { at, et, owner, otherAcc } = await networkHelpers.loadFixture(deployFixture);
  
    const balance = await et.balance();
    expect(balance).to.be.equal(0);

    const ataddr = at.getAddress();
    await et.setAllowedToken(ataddr, true);

    const balance2 = await et.tokenBalance(ataddr);
    expect(balance2).to.be.equal(0);    

  });

  it("Should revert when receiving 0 ETH", async function () {

    const { networkHelpers } = await hre.network.create();
    const { et, owner, otherAcc } = await networkHelpers.loadFixture(deployFixture); 

      await expect(
          owner.sendTransaction({
              to: await et.getAddress(),
              value: 0n
          })
      ).to.be.revertedWithCustomError(
          et,
          "InvalidDeposit"
      );

  }); 

  it("Should NOT deposit native (empty deposit)", async function () {
    
    const { networkHelpers } = await hre.network.create();
    const { et, owner, otherAcc } = await networkHelpers.loadFixture(deployFixture); 
  
    await expect(et.deposit({ value: ethers.parseEther("0") })).to.be.revertedWithCustomError(et, "InvalidDeposit");

  });  

  it("Should receive native ETH tx and emit event for indexer", async function () {

    const { networkHelpers } = await hre.network.create();
    const { et, owner, otherAcc } = await networkHelpers.loadFixture(deployFixture); 

      await expect(
          owner.sendTransaction({
              to: await et.getAddress(),
              value: 10000n
          })
      ).to
       .emit(et, "Deposit")
       .withArgs(
          owner.address,
          ZeroAddress,
          10000n
        );

  });   

  it("Should deposit & withdraw native ", async function () {
    
    const { networkHelpers } = await hre.network.create();
    const { et, owner, otherAcc } = await networkHelpers.loadFixture(deployFixture); 
  
    await expect(et.deposit({ value: ethers.parseEther("1.0") }))
                                                                .to
                                                                .emit(et, "Deposit")
                                                                .withArgs(
                                                                  owner.address,
                                                                  ZeroAddress,
                                                                  ethers.parseEther("1.0")
                                                                );

    const returndata = await et.withdrawEthTo(owner.address, 1n);
    const tx = await returndata.getTransaction();  
    expect(tx?.hash).to.be.not.null;

    const returndata2 = await et.withdrawAllEthTo(owner.address);
    const tx2 = await returndata.getTransaction();  
    expect(tx2?.hash).to.be.not.null;
    

  });    

 it("Should pause & EMIT Pause", async function () {
    
    const { networkHelpers } = await hre.network.create();
    const { et, owner, otherAcc } = await networkHelpers.loadFixture(deployFixture);

    await expect(et.pause()).to.be.emit(et, "Paused");

  });

  it("Should unpause & EMIT Unpause", async function () {
    
    const { networkHelpers } = await hre.network.create();
    const { et, owner, otherAcc } = await networkHelpers.loadFixture(deployFixture);

    await et.pause();
    await expect(et.unpause()).to.be.emit(et, "Unpaused");

  });  

  it("Should NOT unpause (NOT PAUSED)", async function () {
    
    const { networkHelpers } = await hre.network.create();
    const { et, owner, otherAcc } = await networkHelpers.loadFixture(deployFixture);

    await expect(et.unpause()).to.be.revertedWithCustomError(et,"ExpectedPause");

  });    

  it("Should NOT deposit token (empty deposit)", async function () {
    
    const { networkHelpers } = await hre.network.create();
    const { et, owner, otherAcc } = await networkHelpers.loadFixture(deployFixture); 

    await et.setAllowedToken(owner.address, true);
    await expect(et.depositToken(owner.address,0)).to.be.revertedWithCustomError(et, "InvalidDeposit");

  });      

  it("Should NOT deposit token (token not allowed)", async function () {
    
    const { networkHelpers } = await hre.network.create();
    const { et, owner, otherAcc } = await networkHelpers.loadFixture(deployFixture); 
  
    await expect(et.depositToken(owner.address,0)).to.be.revertedWithCustomError(et, "TokenNotAllowed");

  });    

  it("Should deposit & withdraw token ", async function () {
    
    const { networkHelpers } = await hre.network.create();
    const { at, et, owner, otherAcc } = await networkHelpers.loadFixture(deployFixture); 

    const ataddr = at.getAddress();
    await et.setAllowedToken(ataddr, true);

    const etaddr = et.getAddress();
    await at.approve(etaddr, 100n);

    await expect(et.depositToken(ataddr, 100))
                                              .to
                                              .emit(et, "Deposit")
                                              .withArgs(
                                                owner.address,
                                                ataddr,
                                                100n
                                              );

    const returndata = await et.withdrawTokenTo(ataddr, otherAcc.address, 1n);
    const tx = await returndata.getTransaction();  
    expect(tx?.hash).to.be.not.null;

    const returndata2 = await et.withdrawAllTokenTo(ataddr, otherAcc.address);
    const tx2 = await returndata.getTransaction();  
    expect(tx2?.hash).to.be.not.null;
    

  });   

  it("Should NOT withdrawAllEthTo (zero address)", async function () {
    
    const { networkHelpers } = await hre.network.create();
    const { at, et, owner, otherAcc } = await networkHelpers.loadFixture(deployFixture);

    await expect(et.withdrawAllEthTo(ZeroAddress)).to.be.revertedWithCustomError(et, "InvalidAddress"); 


  });

  it("Should NOT withdrawAllEthTo (empty account)", async function () {
    
    const { networkHelpers } = await hre.network.create();
    const { at, et, owner, otherAcc } = await networkHelpers.loadFixture(deployFixture);

    await expect(et.withdrawAllEthTo(otherAcc.address)).to.be.revertedWithCustomError(et, "InsufficientETHBalance"); 


  });  

  it("Should NOT withdrawEthTo (zero address)", async function () {
    
    const { networkHelpers } = await hre.network.create();
    const { at, et, owner, otherAcc } = await networkHelpers.loadFixture(deployFixture);

    await expect(et.withdrawEthTo(ZeroAddress, 100n)).to.be.revertedWithCustomError(et, "InvalidAddress"); 


  });

  it("Should NOT withdrawEthTo (empty account)", async function () {
    
    const { networkHelpers } = await hre.network.create();
    const { at, et, owner, otherAcc } = await networkHelpers.loadFixture(deployFixture);

    await expect(et.withdrawEthTo(otherAcc.address, 100n)).to.be.revertedWithCustomError(et, "InsufficientETHBalance"); 


  });   

  it("Should NOT withdrawTokenTo (token not allowed)", async function () {
    
    const { networkHelpers } = await hre.network.create();
    const { at, et, owner, otherAcc } = await networkHelpers.loadFixture(deployFixture);
  
    const ataddr = at.getAddress();
    await et.setAllowedToken(ataddr, false);

    await expect(et.withdrawTokenTo(ataddr, otherAcc.address, 100n)).to.be.revertedWithCustomError(et, "TokenNotAllowed"); 

  });  

  it("Should NOT withdrawTokenTo (invalid address)", async function () {
    
    const { networkHelpers } = await hre.network.create();
    const { at, et, owner, otherAcc } = await networkHelpers.loadFixture(deployFixture);
  
    const ataddr = at.getAddress();
    await et.setAllowedToken(ataddr, true);

    await expect(et.withdrawTokenTo(ataddr, ZeroAddress, 100n)).to.be.revertedWithCustomError(et, "InvalidAddress"); 


  });

  it("Should NOT withdrawAllTokenTo (token not allowed)", async function () {
    
    const { networkHelpers } = await hre.network.create();
    const { at, et, owner, otherAcc } = await networkHelpers.loadFixture(deployFixture);
  
    const ataddr = at.getAddress();
    await et.setAllowedToken(ataddr, true);

    await expect(et.withdrawAllTokenTo(ataddr, ZeroAddress)).to.be.revertedWithCustomError(et, "InvalidAddress"); 


  });   

  it("Should NOT withdrawAllTokenTo (token not allowed)", async function () {
    
    const { networkHelpers } = await hre.network.create();
    const { at, et, owner, otherAcc } = await networkHelpers.loadFixture(deployFixture);
  
    const ataddr = at.getAddress();
    await et.setAllowedToken(ataddr, false);

    await expect(et.withdrawAllTokenTo(ataddr, otherAcc.getAddress())).to.be.revertedWithCustomError(et, "TokenNotAllowed"); 


  });    

  it("Should NOT withdrawAllTokenTo (zero balance)", async function () {
    
    const { networkHelpers } = await hre.network.create();
    const { at, et, owner, otherAcc } = await networkHelpers.loadFixture(deployFixture);
  
    const ataddr = at.getAddress();
    await et.setAllowedToken(ataddr, true);

    await expect(et.withdrawAllTokenTo(ataddr, otherAcc.getAddress())).to.be.revertedWithCustomError(et, "InsufficientTokenBalance"); 

  });  


  it("Should NOT get token balance (token not allowed)", async function () {
    
    const { networkHelpers } = await hre.network.create();
    const { at, et, owner, otherAcc } = await networkHelpers.loadFixture(deployFixture);

    const ataddr = at.getAddress();
    await et.setAllowedToken(ataddr, false);

    await expect(et.tokenBalance(ataddr)).to.be.revertedWithCustomError(et, "TokenNotAllowed"); 
   

  });  

});