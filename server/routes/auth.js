import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { authenticateToken } from '../middleware/auth.js'
const router = express.Router()

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'User' } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role
    })

    // Add initial credits for registration
    await user.addCredits(100, 'profile_update', 'Registration bonus')

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Error creating user' })
  }
})

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Check password
    const isValidPassword = await user.comparePassword(password)
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Update last active and add daily login credits
    const lastLoginDate = user.lastActive.toDateString()
    const currentDate = new Date().toDateString()
    
    if (lastLoginDate !== currentDate) {
      await user.addCredits(10, 'login', 'Daily login bonus')
    }
    
    user.lastActive = new Date()
    await user.save()

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' })
  }
})

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user data' })
  }
})

// Update profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body
    const user = req.user

    user.name = name

    // Add credits for completing profile if not already done
    if (!user.profileCompleted) {
      user.profileCompleted = true
      await user.addCredits(50, 'profile_update', 'Profile completion bonus')
    }

    await user.save()

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' })
  }
})

export default router