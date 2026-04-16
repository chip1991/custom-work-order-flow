const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: '请输入账号/邮箱和密码' });
  }

  try {
    // Find user by account or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { account: identifier },
          { email: identifier },
        ],
      },
    });

    if (!user) {
      return res.status(401).json({ error: '账号或密码错误' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: '账号或密码错误' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, account: user.account },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        account: user.account,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

module.exports = router;
