'use client';

export function SupabaseSetupRequired() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-2xl bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <svg className="w-20 h-20 mx-auto text-[#F38B08] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Setup Required</h1>
          <p className="text-gray-600 text-lg">Supabase configuration is needed to run the application</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 text-left mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Setup Steps:</h2>
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="bg-[#F38B08] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">1</span>
              <div>
                <strong>Create Supabase Project:</strong>
                <br />
                <span className="text-sm">Go to <a href="https://supabase.com" target="_blank" className="text-[#F38B08] hover:underline">supabase.com</a> and create a new project</span>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-[#F38B08] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">2</span>
              <div>
                <strong>Get API Keys:</strong>
                <br />
                <span className="text-sm">From Settings → API, copy your Project URL and anon public key</span>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-[#F38B08] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">3</span>
              <div>
                <strong>Update Environment Variables:</strong>
                <br />
                <span className="text-sm">Add your keys to the <code className="bg-gray-200 px-1 rounded">.env.local</code> file</span>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-[#F38B08] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">4</span>
              <div>
                <strong>Run Database Schema:</strong>
                <br />
                <span className="text-sm">Execute the SQL from <code className="bg-gray-200 px-1 rounded">supabase/schema.sql</code> in your Supabase SQL Editor</span>
              </div>
            </li>
          </ol>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Environment Variables Needed:</h3>
          <div className="text-left">
            <code className="block bg-white p-3 rounded border text-sm text-gray-800">
              NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co<br />
              NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key<br />
              SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
            </code>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          <p>Once configured, restart your development server and the application will work normally.</p>
        </div>
      </div>
    </div>
  );
}