import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("EctoTreasuryModule", (m) => {
  const et = m.contract("EctoTreasury");

  return { et };
});
