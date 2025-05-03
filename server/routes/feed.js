import express from 'express'
import axios from 'axios'
import Post from '../models/Post.js'
import User from '../models/User.js'
const router = express.Router()

// Helper function to fetch and normalize Reddit posts
async function fetchRedditPosts() {
  try {
    const response = await axios.get('https://www.reddit.com/r/programming/hot.json')
    return response.data.data.children.map(post => ({
      title: post.data.title,
      description: post.data.selftext || 'Click to read more...',
      url: `https://reddit.com${post.data.permalink}`,
      source: 'Reddit',
      category: 'Programming',
      externalId: `reddit-${post.data.id}`
    }))
  } catch (error) {
    console.error('Error fetching Reddit posts:', error)
    return []
  }
}

// Helper function to fetch simulated LinkedIn posts
function getSimulatedLinkedInPosts() {
  return [
    {
      title: 'The Future of Web Development',
      description: 'Exploring emerging trends in web development and their impact on the industry.',
      url: 'https://example.com/web-dev-future',
      source: 'LinkedIn',
      category: 'Technology',
      externalId: 'linkedin-1'
    },
    {
      title: 'Building Scalable Applications',
      description: 'Best practices for creating scalable and maintainable applications.',
      url: 'https://example.com/scalable-apps',
      source: 'LinkedIn',
      category: 'Development',
      externalId: 'linkedin-2'
    }
  ]
}

// Sync posts from external sources
async function syncPosts() {
  try {
    const [redditPosts, linkedInPosts] = await Promise.all([
      fetchRedditPosts(),
      getSimulatedLinkedInPosts()
    ])

    const allPosts = [...redditPosts, ...linkedInPosts]

    for (const postData of allPosts) {
      await Post.findOneAndUpdate(
        { externalId: postData.externalId },
        { ...postData, active: true },
        { upsert: true, new: true }
      )
    }
  } catch (error) {
    console.error('Error syncing posts:', error)
  }
}

// Get feed posts
router.get('/posts', async (req, res) => {
  try {
    // Sync posts in the background
    syncPosts()

    const posts = await Post.find({ active: true })
      .sort({ createdAt: -1 })
      .limit(20)

    // Add saved status for the current user
    const postsWithSavedStatus = posts.map(post => ({
      ...post.toObject(),
      saved: post.savedBy.includes(req.user._id)
    }))

    res.json(postsWithSavedStatus)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts' })
  }
})

// Save post
router.post('/posts/:postId/save', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const post = await Post.findById(req.params.postId);
    const Notification = (await import('../models/Notification.js')).default;

    if (!user || !post) {
      return res.status(404).json({ message: 'Post or user not found' });
    }

    const postIndex = user.savedPosts.indexOf(post._id);

    if (postIndex === -1) {
      user.savedPosts.push(post._id);
      post.savedBy.push(user._id);
      await user.addCredits(5, 'post_interaction', 'Saved a post');
      // Notify post owner if not self
      if (String(post._id) !== String(user._id) && post._id) {
        await Notification.create({
          recipient: post._id,
          type: 'saved',
          post: post._id,
          message: `${user.name} saved your post.`
        });
      }
    } else {
      user.savedPosts.splice(postIndex, 1);
      post.savedBy = post.savedBy.filter(id => !id.equals(user._id));
    }

    await Promise.all([user.save(), post.save()]);

    res.json({ saved: postIndex === -1 });
  } catch (error) {
    console.error('Error saving post:', error);
    res.status(500).json({ message: 'Error saving post' });
  }
});

// Report post
router.post('/posts/:postId/report', async (req, res) => {
  try {
    const { reason } = req.body
    if (!reason) {
      return res.status(400).json({ message: 'Reason is required' })
    }

    const post = await Post.findById(req.params.postId)
    const Notification = (await import('../models/Notification.js')).default;
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    // Check if user has already reported this post
    const existingReport = post.reports.find(report => 
      report.user.equals(req.user._id) && report.status === 'pending'
    )

    if (existingReport) {
      return res.status(400).json({ message: 'You have already reported this post' })
    }

    await post.addReport(req.user._id, reason)
    // Notify admin(s) about the report (for simplicity, notify all admins)
    const User = (await import('../models/User.js')).default;
    const admins = await User.find({ role: 'Admin' });
    for (const admin of admins) {
      await Notification.create({
        recipient: admin._id,
        type: 'reported',
        post: post._id,
        message: `A post has been reported: ${reason}`
      });
    }
    res.json({ message: 'Post reported successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Error reporting post' })
  }
})

// View post
router.post('/posts/:postId/view', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    await post.incrementViews()
    await req.user.addCredits(1, 'post_interaction', 'Viewed a post')

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ message: 'Error recording view' })
  }
})

export default router