import { expect } from "chai";
import { network } from "hardhat";
import hre from "hardhat";

const { ethers } = await hre.network.create();

describe("EctoTreasury unit test", function () {

 // Define a fixture that deploys your contracts and returns whatever you need
  async function deployFixture() {

    const [owner, otherAcc] = await ethers.getSigners(); 

    const ETContract = await ethers.getContractFactory("EctoTreasury");
    const et = await ETContract.deploy();
    await et.waitForDeployment();

    return {  et, owner, otherAcc };
  }

  it("Should get zero balance", async function () {
    
    const { networkHelpers } = await hre.network.create();
    const { et, owner, otherAcc } = await networkHelpers.loadFixture(deployFixture);

  
    const balance = await et.balance();
  
    expect(balance).to.be.equal(0);

  });



});