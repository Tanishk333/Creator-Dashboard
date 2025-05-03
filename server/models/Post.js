import mongoose from 'mongoose'

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  savedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reports: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'resolved'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  externalId: {
    type: String,
    required: true,
    unique: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Index for efficient querying
postSchema.index({ source: 1, externalId: 1 }, { unique: true })
postSchema.index({ category: 1 })
postSchema.index({ createdAt: -1 })

// Virtual for save count
postSchema.virtual('saveCount').get(function() {
  return this.savedBy.length
})

// Method to increment views
postSchema.methods.incrementViews = async function() {
  this.views += 1
  await this.save()
}

// Method to add report
postSchema.methods.addReport = async function(userId, reason) {
  this.reports.push({
    user: userId,
    reason
  })
  await this.save()
}

const Post = mongoose.model('Post', postSchema)

export default Post