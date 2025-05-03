import express from 'express'
import User from '../models/User.js'
import Post from '../models/Post.js'
const router = express.Router()

// Get user dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('savedPosts')
      .select('-password')

    // Get recent activity
    const recentActivity = user.activityLog
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10)
      .map(activity => ({
        type: activity.type,
        credits: activity.credits,
        description: activity.description,
        timestamp: activity.timestamp
      }))

    res.json({
      totalCredits: user.credits,
      savedPosts: user.savedPosts.length,
      recentActivity
    })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats' })
  }
})

// Get saved posts
router.get('/saved-posts', async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'savedPosts',
        select: 'title description url source category views createdAt'
      })

    res.json(user.savedPosts)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching saved posts' })
  }
})

// Get activity history
router.get('/activity', async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    
    const activityLog = user.activityLog
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(activity => ({
        type: activity.type,
        credits: activity.credits,
        description: activity.description,
        timestamp: activity.timestamp
      }))

    res.json(activityLog)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activity history' })
  }
})

// Get credit history
router.get('/credits', async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    
    const creditHistory = user.activityLog
      .filter(activity => activity.credits !== 0)
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(activity => ({
        amount: activity.credits,
        description: activity.description,
        timestamp: activity.timestamp
      }))

    res.json({
      totalCredits: user.credits,
      history: creditHistory
    })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching credit history' })
  }
})

export default router