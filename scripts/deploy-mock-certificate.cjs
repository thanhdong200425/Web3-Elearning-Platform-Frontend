const hre = require("hardhat");

/**
 * This script deploys a mock CertificateNFT contract for testing purposes
 * Use this if you don't have a CertificateNFT contract deployed yet
 */
async function main() {
  console.log("🚀 Deploying Mock CertificateNFT contract...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString(), "\n");

  // Simple mock CertificateNFT contract
  const CertificateNFT = await hre.ethers.getContractFactory("MockCertificateNFT");
  const certificateNFT = await CertificateNFT.deploy();

  await certificateNFT.waitForDeployment();
  const address = await certificateNFT.getAddress();

  console.log("✅ Mock CertificateNFT deployed to:", address);
  console.log("\n📝 Add this to your .env file:");
  console.log(`   CERTIFICATE_NFT_ADDRESS=${address}`);
  console.log("\n💡 You can now deploy ElearningPlatform using this address");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

