import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

export default function Feed() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/api/feed/posts')
      setPosts(response.data)
    } catch (err) {
      setError('Failed to load feed')
    } finally {
      setLoading(false)
    }
  }

  const handleSavePost = async (postId) => {
    try {
      const response = await axios.post(`/api/feed/posts/${postId}/save`);
      const updatedPosts = posts.map(post => {
        if (post._id === postId) {
          return { ...post, saved: response.data.saved };
        }
        return post;
      });
      setPosts(updatedPosts);
      if (window.Notification && Notification.permission === "granted") {
        new Notification(response.data.saved ? "Post saved!" : "Post unsaved.");
      } else if (window.Notification && Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            new Notification(response.data.saved ? "Post saved!" : "Post unsaved.");
          }
        });
      }
    } catch (err) {
      console.error('Failed to save post:', err);
    }
  }

  const handleSharePost = (post) => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.description,
        url: post.url
      })
    } else {
      navigator.clipboard.writeText(post.url)
      alert('Link copied to clipboard!')
    }
  }

  const handleReportPost = async (postId) => {
    const reason = prompt('Please enter the reason for reporting this post:');
    if (!reason) return;

    try {
      await axios.post(`/api/feed/posts/${postId}/report`, { reason });
      alert('Post reported successfully');
      if (window.Notification && Notification.permission === "granted") {
        new Notification("Post reported successfully");
      } else if (window.Notification && Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            new Notification("Post reported successfully");
          }
        });
      }
    } catch (err) {
      console.error('Failed to report post:', err);
    }
  }

  useEffect(() => {
    if (window.Notification && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-700">{error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Content Feed
          </h2>
        </div>
      </div>

      <div className="flow-root">
        <ul role="list" className="-my-6 divide-y divide-gray-200">
          {posts.map((post) => (
            <li key={post._id} className="py-6">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      <a href={post.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600">
                        {post.title}
                      </a>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">{post.source}</p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <span className="inline-flex items-center rounded-full bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700">
                      {post.category}
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-base text-gray-500">{post.description}</p>

                <div className="mt-4 flex space-x-4">
                  <button
                    type="button"
                    onClick={() => handleSavePost(post._id)}
                    className={`inline-flex items-center text-sm font-medium ${post.saved ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                    </svg>
                    {post.saved ? 'Saved' : 'Save'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSharePost(post)}
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                    </svg>
                    Share
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReportPost(post._id)}
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    Report
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}