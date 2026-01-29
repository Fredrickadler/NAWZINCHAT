export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0e1621]">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">404</h1>
        <p className="text-gray-400 mb-8">Page not found</p>
        <a
          href="/login"
          className="px-6 py-2 bg-[#5288c1] hover:bg-[#4a7aad] text-white font-medium rounded-lg transition-colors"
        >
          Go to Login
        </a>
      </div>
    </div>
  )
}

