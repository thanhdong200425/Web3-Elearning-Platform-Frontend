# 🚀 Hướng dẫn Deploy ElearningPlatform Smart Contract với Hardhat

Hướng dẫn chi tiết từng bước để compile và deploy smart contract ElearningPlatform lên Sepolia Testnet.

## 📋 Mục lục

1. [Yêu cầu](#yêu-cầu)
2. [Cài đặt](#cài-đặt)
3. [Cấu hình](#cấu-hình)
4. [Deploy Mock CertificateNFT](#deploy-mock-certificatenft)
5. [Deploy ElearningPlatform](#deploy-elearningplatform)
6. [Verify Contract](#verify-contract)
7. [Cập nhật Frontend](#cập-nhật-frontend)
8. [Troubleshooting](#troubleshooting)

## 🎯 Yêu cầu

- Node.js >= 18.0.0
- npm hoặc yarn
- MetaMask wallet
- Sepolia Testnet ETH (lấy từ [faucet](https://sepoliafaucet.com/))
- Kiến thức cơ bản về Solidity và Hardhat

## 📦 Cài đặt

### Bước 1: Cài đặt dependencies

```bash
# Cài đặt Hardhat và các tools cần thiết
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install --save-dev dotenv
```

Hoặc sử dụng yarn:

```bash
yarn add -D hardhat @nomicfoundation/hardhat-toolbox
yarn add -D dotenv
```

### Bước 2: Khởi tạo Hardhat project (nếu chưa có)

```bash
npx hardhat init
```

Chọn:

- ✅ **Yes** để tạo sample project
- Hoặc chọn **Create an empty hardhat.config.js**

## ⚙️ Cấu hình

### Bước 1: Tạo file .env

Tạo file `.env` trong thư mục gốc của project:

```bash
cp .env.example .env
```

### Bước 2: Cấu hình .env

Mở file `.env` và điền thông tin:

```env
# Private key của account bạn muốn deploy
# LẤY TỪ METAMASK: Account Details > Show Private Key
# ⚠️ KHÔNG BAO GIỜ chia sẻ hoặc commit private key này!
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

# Sepolia RPC URL
# Có thể dùng public RPC hoặc lấy từ Alchemy/Infura
SEPOLIA_RPC_URL=https://rpc.sepolia.org

# Địa chỉ CertificateNFT contract
# Sẽ cập nhật sau khi deploy MockCertificateNFT
CERTIFICATE_NFT_ADDRESS=0x0000000000000000000000000000000000000000
```

### Bước 3: Lấy Private Key từ MetaMask

1. Mở MetaMask
2. Click vào account bạn muốn dùng để deploy
3. Click vào menu (3 chấm) > **Account Details**
4. Click **Show Private Key**
5. Nhập password và copy private key
6. Paste vào file `.env`

⚠️ **CẢNH BÁO**: Private key rất nhạy cảm! Không bao giờ:

- Commit vào Git
- Chia sẻ với người khác
- Sử dụng account chính (mainnet)

### Bước 4: Lấy Sepolia ETH

1. Truy cập [Sepolia Faucet](https://sepoliafaucet.com/)
2. Đăng nhập với Alchemy account
3. Nhập địa chỉ wallet của bạn
4. Request Sepolia ETH (cần khoảng 0.1-0.2 ETH để deploy)

## 🎫 Deploy Mock CertificateNFT

Nếu bạn chưa có CertificateNFT contract, hãy deploy mock contract trước:

### Bước 1: Deploy Mock CertificateNFT

```bash
npx hardhat run scripts/deploy-mock-certificate.js --network sepolia
```

### Bước 2: Copy địa chỉ contract

Sau khi deploy thành công, bạn sẽ thấy:

```
✅ Mock CertificateNFT deployed to: 0x1234...
```

### Bước 3: Cập nhật .env

Cập nhật `CERTIFICATE_NFT_ADDRESS` trong file `.env`:

```env
CERTIFICATE_NFT_ADDRESS=0x1234... # Địa chỉ vừa deploy
```

## 🚀 Deploy ElearningPlatform

### Bước 1: Compile Contract

```bash
npx hardhat compile
```

Kết quả mong đợi:

```
Compiled 1 Solidity file successfully
```

Nếu có lỗi, kiểm tra:

- Solidity version trong `hardhat.config.js` (phải là 0.8.20)
- Cú pháp trong file `.sol`

### Bước 2: Deploy Contract

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

Kết quả mong đợi:

```
🚀 Starting deployment of ElearningPlatform contract...

📝 Deploying contracts with account: 0xYourAddress...
💰 Account balance: 100000000000000000

📋 CertificateNFT Address: 0xCertificateNFTAddress...

⏳ Deploying ElearningPlatform...
✅ ElearningPlatform deployed to: 0xElearningPlatformAddress...

📊 Deployment Details:
   Network: sepolia
   Deployer: 0xYourAddress...
   Contract Address: 0xElearningPlatformAddress...
   CertificateNFT Address: 0xCertificateNFTAddress...

⏳ Waiting for block confirmations...
✅ Contract confirmed on blockchain

🎉 Deployment completed successfully!
```

### Bước 3: Copy Contract Address

Copy địa chỉ contract được deploy (ví dụ: `0xElearningPlatformAddress...`)

## ✅ Verify Contract (Tùy chọn)

Để verify contract trên Etherscan:

### Bước 1: Lấy API Key từ Etherscan

1. Truy cập [Etherscan](https://etherscan.io/)
2. Đăng ký/Đăng nhập
3. Vào [API Keys](https://etherscan.io/myapikey)
4. Tạo API key mới
5. Copy API key

### Bước 2: Cài đặt hardhat-verify plugin

```bash
npm install --save-dev @nomicfoundation/hardhat-verify
```

### Bước 3: Cập nhật hardhat.config.js

Thêm vào `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-verify");

module.exports = {
  // ... existing config
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
```

### Bước 4: Thêm API key vào .env

```env
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### Bước 5: Verify contract

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> "<CERTIFICATE_NFT_ADDRESS>"
```

Ví dụ:

```bash
npx hardhat verify --network sepolia 0x1234... "0x5678..."
```

## 🔄 Cập nhật Frontend

### Bước 1: Cập nhật Contract Address

Mở file `src/contracts/ElearningPlatform.ts` và cập nhật:

```typescript
export const elearningPlatformAddress = "0xYourDeployedContractAddress"; // Thay bằng địa chỉ vừa deploy
```

### Bước 2: Kiểm tra ABI

ABI đã được cập nhật sẵn trong file, không cần thay đổi gì.

### Bước 3: Test Frontend

```bash
npm run dev
```

Truy cập ứng dụng và test các tính năng:

1. Tạo khóa học mới
2. Mua khóa học
3. Xem khóa học đã mua

## 🐛 Troubleshooting

### Lỗi: "Insufficient funds"

**Nguyên nhân**: Không đủ Sepolia ETH để trả gas fee

**Giải pháp**:

- Kiểm tra số dư trong MetaMask
- Request thêm Sepolia ETH từ faucet
- Kiểm tra địa chỉ wallet trong `.env` có đúng không

### Lỗi: "nonce too high"

**Nguyên nhân**: Nonce không khớp

**Giải pháp**:

- Reset MetaMask account (Settings > Advanced > Reset Account)
- Hoặc đợi vài phút rồi thử lại

### Lỗi: "CertificateNFT address is not set"

**Nguyên nhân**: Chưa set `CERTIFICATE_NFT_ADDRESS` trong `.env`

**Giải pháp**:

- Deploy MockCertificateNFT trước
- Cập nhật `CERTIFICATE_NFT_ADDRESS` trong `.env`

### Lỗi: "Contract verification failed"

**Nguyên nhân**: Thông tin verify không đúng

**Giải pháp**:

- Kiểm tra lại constructor parameters
- Đảm bảo đã set `ETHERSCAN_API_KEY`
- Đợi vài phút sau khi deploy rồi verify

### Lỗi: "Compilation errors"

**Nguyên nhân**: Lỗi cú pháp trong Solidity

**Giải pháp**:

- Kiểm tra Solidity version (phải là 0.8.20)
- Kiểm tra cú pháp trong file `.sol`
- Xem thông báo lỗi chi tiết

## 📚 Tài liệu tham khảo

- [Hardhat Documentation](https://hardhat.org/docs)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Etherscan Sepolia](https://sepolia.etherscan.io/)

## 🎉 Hoàn thành!

Sau khi deploy thành công, bạn có thể:

- ✅ Tạo khóa học mới
- ✅ Mua khóa học
- ✅ Xem khóa học đã mua
- ✅ Xem nội dung khóa học từ IPFS

Chúc bạn thành công! 🚀
