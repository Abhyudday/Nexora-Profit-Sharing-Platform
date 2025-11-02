# ETH Testnet Setup Guide

This guide will help you configure and test the deposit system using Ethereum Sepolia testnet.

## 🚀 Quick Setup

### 1. Configure Backend Environment

Add these variables to your `backend/.env` file:

```bash
# Deposit Configuration
ADMIN_DEPOSIT_WALLET=0x...your-ethereum-wallet-address
DEPOSIT_NETWORK=Sepolia Testnet
DEPOSIT_TOKEN=ETH
```

### 2. Restart Backend Server

```bash
cd backend
npm run dev
```

### 3. Get Test ETH

You'll need testnet ETH to test deposits. Get free Sepolia ETH from these faucets:

**Sepolia Faucets:**
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia
- https://faucet.quicknode.com/ethereum/sepolia

**How to use:**
1. Install MetaMask or any Ethereum wallet
2. Switch to Sepolia Testnet in your wallet
3. Copy your wallet address
4. Paste it into the faucet website
5. Receive free test ETH (usually 0.5 - 1 ETH)

## 📝 Testing the Deposit Flow

### Step 1: Register a User
1. Go to `/register`
2. Create a new account
3. Login with your credentials

### Step 2: Make a Test Deposit
1. Click the "Deposit" button
2. You'll see:
   - **Network:** Sepolia Testnet
   - **Token:** ETH
   - **Admin Wallet:** Your configured address
   - **Test Mode Badge:** 🧪 Test Network Mode

3. Send testnet ETH:
   - Use MetaMask or any wallet
   - Send to the displayed admin wallet address
   - Minimum: 0.001 ETH (very low for testing)
   - Copy the transaction hash

4. Fill the deposit form:
   - **Amount:** e.g., 0.1 ETH
   - **Your Wallet Address:** Your MetaMask address
   - **Transaction Hash:** Paste from MetaMask
   - Click "Submit Deposit Request"

### Step 3: Admin Approval
1. Login as admin
2. Go to Admin Dashboard
3. See pending deposits
4. Click ✓ to approve
5. User balance will update

## 🔄 Switching to Production (USDT TRC20)

When ready for production, update your `.env`:

```bash
# Production Configuration
ADMIN_DEPOSIT_WALLET=TRX...your-trc20-wallet-address
DEPOSIT_NETWORK=TRC20
DEPOSIT_TOKEN=USDT
```

The system will automatically:
- Remove the testnet badge
- Change minimum deposit to $100
- Update all labels to show USDT
- Display TRC20 network warnings

## 🎯 Testnet Features

In testnet mode:
- ✅ Minimum deposit: 0.001 ETH (vs $100 production)
- ✅ Blue "Test Network Mode" badge
- ✅ Different validation messages
- ✅ "Testnet deposit" remark in transactions
- ✅ Helpful faucet instructions

## 🔍 Verify Configuration

Check if your setup is correct:

1. **Open deposit modal** and verify:
   - Network shows "Sepolia Testnet"
   - Token shows "ETH"
   - Test mode badge is visible
   - Admin wallet address is correct

2. **Test a small deposit:**
   - Use 0.01 ETH from faucet
   - Complete the full flow
   - Verify admin can approve

## 📱 MetaMask Setup

### Add Sepolia Network to MetaMask:

If Sepolia isn't in your networks:

1. Open MetaMask
2. Click network dropdown
3. Click "Add Network"
4. Manual entry:
   - **Network Name:** Sepolia Testnet
   - **RPC URL:** https://rpc.sepolia.org
   - **Chain ID:** 11155111
   - **Currency Symbol:** SepoliaETH
   - **Block Explorer:** https://sepolia.etherscan.io

## 🛠️ Alternative Testnets

You can also use other testnets:

**Goerli:**
```bash
DEPOSIT_NETWORK=Goerli Testnet
DEPOSIT_TOKEN=ETH
```

**Polygon Mumbai:**
```bash
DEPOSIT_NETWORK=Mumbai Testnet
DEPOSIT_TOKEN=MATIC
```

The system automatically detects "test", "sepolia", or "goerli" in the network name.

## ❓ Troubleshooting

**"Deposit wallet not configured"**
- Check `ADMIN_DEPOSIT_WALLET` is set in `.env`
- Restart backend server
- Must be valid Ethereum address (starts with 0x)

**Transaction not showing up**
- Wait 30-60 seconds for blockchain confirmation
- Check Sepolia Etherscan with your tx hash
- Ensure you sent to correct admin wallet

**Insufficient funds**
- Get more testnet ETH from faucets
- Some faucets have daily limits
- Try multiple faucets if needed

## 🎉 Success Checklist

- ✅ Backend configured with testnet settings
- ✅ Admin wallet address set
- ✅ Test ETH received from faucet
- ✅ User can see deposit modal with testnet info
- ✅ Deposit submitted successfully
- ✅ Admin can approve deposit
- ✅ User balance updated

You're now ready to test the full MLM deposit workflow! 🚀
