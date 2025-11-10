import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { checkWithdrawalTimeWindow } from '../utils/withdrawal.util';

const prisma = new PrismaClient();

export const createDeposit = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { amount, walletAddress, txHash } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    // Check if testnet mode (lower minimum requirements for testing)
    const network = process.env.DEPOSIT_NETWORK || 'Sepolia Testnet';
    const isTestnet = network.toLowerCase().includes('test') || 
                      network.toLowerCase().includes('sepolia') || 
                      network.toLowerCase().includes('goerli');
    
    const minDeposit = isTestnet ? 0.001 : 100;
    
    if (parseFloat(amount) < minDeposit) {
      return res.status(400).json({ 
        error: `Minimum deposit is ${minDeposit} ${process.env.DEPOSIT_TOKEN || 'USDT'}` 
      });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount: parseFloat(amount),
        type: 'DEPOSIT',
        status: 'PENDING',
        walletAddress,
        txHash: txHash || null,
        remarks: isTestnet ? 'Testnet deposit' : null,
      },
    });

    res.status(201).json({
      message: 'Deposit request submitted. Awaiting admin approval.',
      transaction,
      isTestnet,
    });
  } catch (error) {
    console.error('Create deposit error:', error);
    res.status(500).json({ error: 'Failed to create deposit request' });
  }
};

export const createWithdrawal = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { amount, walletAddress } = req.body;

    // Check withdrawal time window (06:01 AM - 12:00 PM GMT+7)
    const timeStatus = checkWithdrawalTimeWindow();
    if (!timeStatus.isEnabled) {
      return res.status(400).json({ 
        error: timeStatus.message,
        nextEnabledTime: timeStatus.nextEnabledTime,
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Check minimum withdrawal amount ($10)
    const minWithdrawal = 10;
    if (parseFloat(amount) < minWithdrawal) {
      return res.status(400).json({ 
        error: `Minimum withdrawal amount is $${minWithdrawal}` 
      });
    }

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    // Check user balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount: parseFloat(amount),
        type: 'WITHDRAWAL',
        status: 'PENDING',
        walletAddress,
      },
    });

    res.status(201).json({
      message: 'Withdrawal request submitted. Awaiting admin approval.',
      transaction,
    });
  } catch (error) {
    console.error('Create withdrawal error:', error);
    res.status(500).json({ error: 'Failed to create withdrawal request' });
  }
};

export const getMyTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { type, status, page = 1, limit = 20 } = req.query;

    const where: any = { userId };
    if (type) where.type = type;
    if (status) where.status = status;

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const total = await prisma.transaction.count({ where });

    res.json({
      transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};
