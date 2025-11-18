export default function DatabaseError() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Database Configuration Required
          </h1>
          
          <p className="text-lg text-gray-600 mb-6">
            This application requires a database connection to function.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">
              For Production Deployment:
            </h2>
            <ol className="space-y-3 text-sm text-blue-800">
              <li className="flex items-start">
                <span className="font-semibold mr-2">1.</span>
                <span>Set up a PostgreSQL database (Vercel Postgres, Supabase, or similar)</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">2.</span>
                <span>Update <code className="bg-blue-100 px-1 rounded">prisma/schema.prisma</code> to use PostgreSQL provider</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">3.</span>
                <span>Set the <code className="bg-blue-100 px-1 rounded">DATABASE_URL</code> environment variable in Vercel</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">4.</span>
                <span>Run <code className="bg-blue-100 px-1 rounded">npx prisma migrate deploy</code></span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">5.</span>
                <span>Redeploy your application</span>
              </li>
            </ol>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Note: SQLite Limitation
            </h3>
            <p className="text-sm text-gray-600">
              This application uses SQLite for local development, which is not compatible with Vercel's serverless architecture. 
              A PostgreSQL database is required for production deployment.
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Developed by <span className="font-semibold">Omar Rageh</span>
            </p>
            <a 
              href="https://github.com/eltahawyomar001-eng/PDF-Gen" 
              className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Documentation on GitHub →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
