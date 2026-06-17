import { network } from "hardhat";
import hre from "hardhat";

const { ethers } = await hre.network.create("localhost");

async function main() {

    const treasuryAddress =
        "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    const [signer] =
        await ethers.getSigners();

    console.log(
        "Network:",
        await ethers.provider.send(
            "web3_clientVersion",
            []
        )
    );

    console.log(
        "Address:",
        signer.address
    );

    console.log(
        "Nonce before:",
        await signer.getNonce()
    );

    const net =
        await ethers.provider.getNetwork();

    console.log(
        "Chain ID:",
        net.chainId
    );

    const treasury =
        await ethers.getContractAt(
            "EctoTreasury",
            treasuryAddress
        );

    const before =
        await ethers.provider.getBalance(
            treasuryAddress
        );

    console.log(
        "Balance Before:",
        ethers.formatEther(before)
    );

    const tx =
        await treasury.deposit({
            value:
                ethers.parseEther("1")
        });

    console.log(
        "Transaction sent:",
        tx.hash
    );

    await tx.wait();

    const after =
        await ethers.provider.getBalance(
            treasuryAddress
        );

    console.log(
        "Balance After:",
        ethers.formatEther(after)
    );
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});