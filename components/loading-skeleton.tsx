export function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-white border-b border-gray-200 px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-lg" />
            <div>
              <div className="h-6 bg-gray-300 rounded w-64 mb-2" />
              <div className="h-4 bg-gray-300 rounded w-48" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex h-[calc(100vh-120px)]">
        <div className="w-full lg:w-1/3 border-r border-gray-200 bg-white">
          <div className="p-4 space-y-4">
            <div className="h-8 bg-gray-300 rounded" />
            <div className="h-10 bg-gray-300 rounded" />
            <div className="h-10 bg-gray-300 rounded" />
          </div>
          <div className="space-y-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-4 border-b border-gray-100">
                <div className="flex items-start space-x-3">
                  <div className="w-4 h-4 bg-gray-300 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-20 mb-2" />
                    <div className="h-4 bg-gray-300 rounded w-full mb-1" />
                    <div className="h-3 bg-gray-300 rounded w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="hidden lg:block lg:w-2/3">
          <div className="h-full bg-gray-300" />
        </div>
      </div>
    </div>
  );
}