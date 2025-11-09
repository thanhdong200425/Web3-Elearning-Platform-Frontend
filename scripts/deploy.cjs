const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment of ElearningPlatform contract...\n");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString(), "\n");

  // CertificateNFT address - UPDATE THIS WITH YOUR DEPLOYED CERTIFICATE NFT ADDRESS
  // If you don't have one yet, you can deploy a mock one first
  const CERTIFICATE_NFT_ADDRESS = process.env.CERTIFICATE_NFT_ADDRESS;
  
  if (!CERTIFICATE_NFT_ADDRESS) {
    console.error("❌ Error: CERTIFICATE_NFT_ADDRESS is not set in .env file");
    console.log("💡 Please set CERTIFICATE_NFT_ADDRESS in your .env file");
    console.log("💡 Or deploy CertificateNFT contract first and update the address");
    process.exit(1);
  }

  console.log("📋 CertificateNFT Address:", CERTIFICATE_NFT_ADDRESS, "\n");

  // Deploy ElearningPlatform
  console.log("⏳ Deploying ElearningPlatform...");
  const ElearningPlatform = await hre.ethers.getContractFactory("ElearningPlatform");
  const elearningPlatform = await ElearningPlatform.deploy(CERTIFICATE_NFT_ADDRESS);

  await elearningPlatform.waitForDeployment();
  const contractAddress = await elearningPlatform.getAddress();

  console.log("✅ ElearningPlatform deployed to:", contractAddress);
  console.log("\n📊 Deployment Details:");
  console.log("   Network:", hre.network.name);
  console.log("   Deployer:", deployer.address);
  console.log("   Contract Address:", contractAddress);
  console.log("   CertificateNFT Address:", CERTIFICATE_NFT_ADDRESS);

  // Wait for a few block confirmations
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n⏳ Waiting for block confirmations...");
    await elearningPlatform.deploymentTransaction().wait(5);
    console.log("✅ Contract confirmed on blockchain");
  }

  // Verify contract on Etherscan (optional)
  if (hre.network.name === "sepolia") {
    console.log("\n💡 To verify the contract on Etherscan, run:");
    console.log(`   npx hardhat verify --network sepolia ${contractAddress} "${CERTIFICATE_NFT_ADDRESS}"`);
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📝 Next steps:");
  console.log("   1. Update elearningPlatformAddress in src/contracts/ElearningPlatform.ts");
  console.log("   2. The ABI is already updated in the same file");
  console.log("   3. Test the contract functions");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

