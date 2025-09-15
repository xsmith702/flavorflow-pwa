import Link from 'next/link';
import { 
  ArchiveBoxIcon, 
  BookOpenIcon, 
  ChartBarIcon,
  ClockIcon,
  SparklesIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight">
              <span className="text-gradient">Transform Your</span>
              <br />
              <span className="text-white">Cooking Experience</span>
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto px-2">
              Smart pantry management meets intelligent recipe discovery. 
              Cook with confidence, reduce waste, and discover amazing meals 
              from ingredients you already have.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link
                href="/pantry"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 touch-manipulation min-h-[44px]"
              >
                <ArchiveBoxIcon className="h-5 w-5 mr-2" />
                Manage Pantry
              </Link>
              <Link
                href="/recipes"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 touch-manipulation min-h-[44px]"
              >
                <BookOpenIcon className="h-5 w-5 mr-2" />
                Discover Recipes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-b from-transparent to-black/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Everything You Need to Cook Smart
            </h2>
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto px-2">
              Powerful features designed to make cooking more efficient, 
              enjoyable, and sustainable.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Pantry Management */}
            <Link href="/pantry" className="group">
              <div className="glass-hover rounded-2xl p-6 sm:p-8 h-full">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-200">
                  <ArchiveBoxIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">Smart Pantry</h3>
                <p className="text-sm sm:text-base text-gray-300 mb-4">
                  Track ingredients, monitor expiration dates, and get low-stock alerts. 
                  Never run out of essentials again.
                </p>
                <div className="flex items-center text-orange-400 text-sm font-medium">
                  Manage pantry
                  <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Recipe Discovery */}
            <Link href="/recipes" className="group">
              <div className="glass-hover rounded-2xl p-6 sm:p-8 h-full">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-200">
                  <BookOpenIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">Recipe Discovery</h3>
                <p className="text-sm sm:text-base text-gray-300 mb-4">
                  Find perfect recipes based on your available ingredients. 
                  Discover new flavors and cooking techniques.
                </p>
                <div className="flex items-center text-indigo-400 text-sm font-medium">
                  Explore recipes
                  <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Analytics */}
            <div className="group">
              <div className="glass-hover rounded-2xl p-6 sm:p-8 h-full">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-200">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">Smart Analytics</h3>
                <p className="text-sm sm:text-base text-gray-300 mb-4">
                  Track your cooking patterns, reduce food waste, and optimize 
                  your grocery shopping with data-driven insights.
                </p>
                <div className="flex items-center text-cyan-400 text-sm font-medium">
                  Coming soon
                  <SparklesIcon className="ml-2 h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="group">
              <div className="glass-hover rounded-2xl p-6 sm:p-8 h-full">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-200">
                  <ClockIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">Quick Actions</h3>
                <p className="text-sm sm:text-base text-gray-300 mb-4">
                  Fast ingredient scanning, one-tap recipe suggestions, 
                  and instant meal planning for busy lifestyles.
                </p>
                <div className="flex items-center text-green-400 text-sm font-medium">
                  Coming soon
                  <SparklesIcon className="ml-2 h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Collaboration */}
            <div className="group">
              <div className="glass-hover rounded-2xl p-6 sm:p-8 h-full">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-200">
                  <UserGroupIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">Family Sharing</h3>
                <p className="text-sm sm:text-base text-gray-300 mb-4">
                  Share your pantry and recipes with family members. 
                  Coordinate meal planning and shopping together.
                </p>
                <div className="flex items-center text-pink-400 text-sm font-medium">
                  Coming soon
                  <SparklesIcon className="ml-2 h-4 w-4" />
                </div>
              </div>
            </div>

            {/* AI Assistant */}
            <div className="group">
              <div className="glass-hover rounded-2xl p-6 sm:p-8 h-full">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-200">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">AI Assistant</h3>
                <p className="text-sm sm:text-base text-gray-300 mb-4">
                  Get personalized cooking tips, ingredient substitutions, 
                  and smart recommendations powered by AI.
                </p>
                <div className="flex items-center text-yellow-400 text-sm font-medium">
                  Coming soon
                  <SparklesIcon className="ml-2 h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
              Ready to Transform Your Cooking?
            </h2>
            <p className="text-base sm:text-lg text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
              Join thousands of home cooks who are already cooking smarter, 
              wasting less, and enjoying more delicious meals.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link
                href="/pantry"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 touch-manipulation min-h-[44px]"
              >
                Start with Pantry
              </Link>
              <Link
                href="/recipes"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 touch-manipulation min-h-[44px]"
              >
                Browse Recipes
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
