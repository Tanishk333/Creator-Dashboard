import { useState, useEffect } from 'react'
import axios from 'axios'

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [creditAmount, setCreditAmount] = useState('')
  const [contentStats, setContentStats] = useState({
    totalPosts: 0,
    topSavedContent: [],
    mostActiveUsers: []
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [usersResponse, reportsResponse, statsResponse] = await Promise.all([
        axios.get('https://creator-dashboard-ms4w.onrender.com/api/admin/users'),
        axios.get('https://creator-dashboard-ms4w.onrender.com/api/admin/reports'),
        axios.get('https://creator-dashboard-ms4w.onrender.com/api/admin/stats')
      ])
      setUsers(usersResponse.data)
      setReports(reportsResponse.data)
      setContentStats(statsResponse.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateCredits = async (e) => {
    e.preventDefault()
    if (!selectedUser || !creditAmount) return

    try {
      const response = await axios.post(`https://creator-dashboard-ms4w.onrender.com/api/admin/users/${selectedUser}/credits`, {
        amount: parseInt(creditAmount)
      })
      // Update user credits in state
      setUsers(users.map(user => {
        if (user._id === selectedUser) {
          return { ...user, credits: response.data.user.credits }
        }
        return user
      }))
      // Reset form
      setSelectedUser(null)
      setCreditAmount("")
      // Optionally show a success message
      alert("Credits updated successfully!")
    } catch (err) {
      console.error('Failed to update credits:', err)
      alert('Failed to update credits: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleResolveReport = async (reportId) => {
    try {
      await axios.post(`https://creator-dashboard-ms4w.onrender.com/api/admin/reports/${reportId}/resolve`)
      // Update reports state immediately
      setReports(reports.filter(report => report.reportId !== reportId))
    } catch (err) {
      console.error('Failed to resolve report:', err)
    }
  }

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
            Admin Dashboard
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Credit Management */}
        <div className="card">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Credit Management</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <form onSubmit={handleUpdateCredits} className="space-y-4">
              <div>
                <label htmlFor="user" className="block text-sm font-medium text-gray-700">
                  Select User
                </label>
                <select
                  id="user"
                  value={selectedUser || ''}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="input-field mt-1"
                  required
                >
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email}) - Current Credits: {user.credits}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="credits" className="block text-sm font-medium text-gray-700">
                  Credit Amount
                </label>
                <input
                  type="number"
                  id="credits"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  placeholder="Enter amount (positive or negative)"
                  className="input-field mt-1"
                  required
                />
              </div>

              <button type="submit" className="btn-primary">
                Update Credits
              </button>
            </form>
          </div>
        </div>

        {/* User Analytics */}
        <div className="card">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">User Analytics</h3>
          </div>
          <div className="border-t border-gray-200">
            <dl className="divide-y divide-gray-200">
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Total Users</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {users.length}
                </dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Total Credits</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {users.reduce((sum, user) => sum + user.credits, 0)}
                </dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Active Users</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {users.filter(user => user.lastActive > Date.now() - 7 * 24 * 60 * 60 * 1000).length}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Content Stats */}
      <div className="card">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Content Statistics</h3>
          <p className="mt-1 text-sm text-gray-500">Overview of content engagement</p>
        </div>
        <div className="border-t border-gray-200">
          <dl className="divide-y divide-gray-200">
            <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Most Saved Content</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <ul className="divide-y divide-gray-200">
                  {contentStats.topSavedContent.map((content, index) => (
                    <li key={index} className="py-2">
                      <div className="flex justify-between">
                        <span>{content.title}</span>
                        <span className="text-gray-500">{content.saves} saves</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
            <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Most Active Users</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <ul className="divide-y divide-gray-200">
                  {contentStats.mostActiveUsers.map((user, index) => (
                    <li key={index} className="py-2">
                      <div className="flex justify-between">
                        <span>{user.name}</span>
                        <span className="text-gray-500">{user.activity} actions</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Content Reports */}
      <div className="card">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Content Reports</h3>
          <p className="mt-1 text-sm text-gray-500">Review and manage reported content</p>
        </div>
        <div className="border-t border-gray-200">
          <ul role="list" className="divide-y divide-gray-200">
            {reports.map((report) => (
              <li key={report.reportId} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-sm font-medium text-gray-900">{report.postTitle}</h4>
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                        Reported
                      </span>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Reason: </span>
                        {report.reason}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <span>Reported by: {report.user}</span>
                      <span>•</span>
                      <span>Date: {new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="ml-4 flex items-center space-x-2">
                    <button
                      onClick={() => handleResolveReport(report.reportId)}
                      className="inline-flex items-center rounded-md bg-green-50 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
                    >
                      <svg className="-ml-0.5 mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Resolve
                    </button>
                  </div>
                </div>
              </li>
            ))}
            {reports.length === 0 && (
              <li className="px-4 py-4 sm:px-6">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 002.25 2.25h.75a3 3 0 003-3V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No reports</h3>
                  <p className="mt-1 text-sm text-gray-500">No content has been reported yet</p>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
