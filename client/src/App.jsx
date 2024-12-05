import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Navigation */}
        <nav className="bg-white shadow-lg">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <div className="flex space-x-4">
                <Link to="/" className="text-gray-800 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                  Home
                </Link>
                <Link to="/vote" className="text-gray-800 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                  Vote
                </Link>
                <Link to="/results" className="text-gray-800 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                  Results
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/vote" element={<Vote />} />
            <Route path="/results" element={<Results />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

// Example Components
function Home() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Blockchain Voting System</h1>
      <p className="text-lg text-gray-600">Welcome to the secure and transparent voting platform</p>
    </div>
  )
}

function Vote() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Cast Your Vote</h2>
      <p className="text-gray-600">Voting interface will be implemented here</p>
    </div>
  )
}

function Results() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Election Results</h2>
      <p className="text-gray-600">Results will be displayed here</p>
    </div>
  )
}

export default App
