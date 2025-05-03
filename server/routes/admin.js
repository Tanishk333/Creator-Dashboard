import express from 'express'
import User from '../models/User.js'
import Post from '../models/Post.js'
import { authenticateToken, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all users
router.get('/users', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Adjust user credits
router.post('/users/:userId/credits', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { amount, description } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await user.addCredits(amount, 'admin_adjustment', description || 'Admin credit adjustment');
    await user.save();
    res.json({ credits: user.credits, user: { id: user._id, name: user.name, email: user.email, credits: user.credits } });
  } catch (error) {
    console.error('Error adjusting credits:', error);
    res.status(500).json({ message: error.message || 'Error adjusting credits' });
  }
});

// Get all reports (pending)
router.get('/reports', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const posts = await Post.find({ 'reports.status': 'pending' }).populate('reports.user', 'name email');
    const reports = [];
    posts.forEach(post => {
      post.reports.forEach(report => {
        if (report.status === 'pending') {
          reports.push({
            postId: post._id,
            postTitle: post.title,
            reportId: report._id,
            user: report.user ? report.user.name : '',
            userEmail: report.user ? report.user.email : '',
            reason: report.reason,
            status: report.status,
            createdAt: report.createdAt
          });
        }
      });
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reports' });
  }
});

// Get content statistics
router.get('/stats', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    // Get most saved content
    const topSavedContent = await Post.aggregate([
      { $match: { active: true } },
      { $project: { title: 1, saves: { $size: "$savedBy" } } },
      { $sort: { saves: -1 } },
      { $limit: 5 }
    ]);

    // Get most active users (use activityLog)
    const mostActiveUsers = await User.aggregate([
      { $project: { name: 1, activity: { $size: "$activityLog" } } },
      { $sort: { activity: -1 } },
      { $limit: 5 }
    ]);

    // Get total posts
    const totalPosts = await Post.countDocuments({ active: true });

    res.json({
      totalPosts,
      topSavedContent,
      mostActiveUsers
    });
  } catch (error) {
    console.error('Error in /api/admin/stats:', error);
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});


// Resolve a report
router.post('/reports/:reportId/resolve', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { action } = req.body; // e.g., 'dismiss', 'remove_post'
    const posts = await Post.find({ 'reports._id': req.params.reportId }).populate('reports.user', 'name email');
    if (posts.length === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }
    const post = posts[0];
    const report = post.reports.id(req.params.reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    report.status = 'resolved';
    if (action === 'remove_post') {
      post.active = false;
    }
    await post.save();
    // Return updated report and post info
    res.json({
      message: 'Report resolved',
      report: {
        reportId: report._id,
        status: report.status,
        user: report.user ? report.user.name : '',
        userEmail: report.user ? report.user.email : '',
        reason: report.reason,
        createdAt: report.createdAt
      },
      post: {
        postId: post._id,
        postTitle: post.title,
        active: post.active
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error resolving report' });
  }
});

export default router;