import { TrendingUp, BarChart3, Bell, Shield, ArrowRight, Zap } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-emerald-400" />
              <span className="text-2xl font-bold text-white">PricePredict</span>
            </div>
            <button
              onClick={onGetStarted}
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/50"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-8">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-sm font-medium">AI-Powered Predictions</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Predict Market Prices
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  Before They Move
                </span>
              </h1>

              <p className="text-xl text-slate-300 mb-10 leading-relaxed">
                Get accurate predictions on commodity prices including gold, silver, platinum,
                and fuel. Make informed decisions with real-time data and historical trends.
              </p>

              <button
                onClick={onGetStarted}
                className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-xl font-semibold text-lg transition-all duration-200 hover:shadow-2xl hover:shadow-emerald-500/50 hover:scale-105"
              >
                <span>Start Predicting</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: TrendingUp, title: '7 Commodities', desc: 'Track gold, silver, platinum, petrol, diesel, LPG, CNG' },
                { icon: BarChart3, title: 'Historical Data', desc: 'View past trends and patterns across any timeframe' },
                
                { icon: Shield, title: 'Accurate AI', desc: 'Machine learning powered predictions you can trust' }
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-200 hover:border-emerald-500/50 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                    <feature.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-800/30 border-y border-slate-700/50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Commodities We Track
              </h2>
              <p className="text-slate-400 text-lg">
                Real-time price tracking and predictions for essential commodities
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {[
                { name: 'Gold', unit: '₹/10g', color: 'from-yellow-500 to-yellow-600' },
                { name: 'Silver', unit: '₹/kg', color: 'from-slate-400 to-slate-500' },
                { name: 'Platinum', unit: '₹/10g', color: 'from-gray-300 to-gray-400' },
                { name: 'Petrol', unit: '₹/L', color: 'from-orange-500 to-red-500' },
                { name: 'Diesel', unit: '₹/L', color: 'from-amber-600 to-orange-600' },
                { name: 'LPG', unit: '₹/cyl', color: 'from-blue-500 to-blue-600' },
                { name: 'CNG', unit: '₹/kg', color: 'from-green-500 to-green-600' }
              ].map((commodity) => (
                <div
                  key={commodity.name}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:border-emerald-500/50 transition-all duration-200 hover:scale-105"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${commodity.color} rounded-lg mx-auto mb-3`}></div>
                  <h3 className="text-white font-semibold text-center">{commodity.name}</h3>
                  <p className="text-slate-400 text-sm text-center mt-1">{commodity.unit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Make Smarter Decisions?
            </h2>
            <p className="text-slate-300 text-lg mb-10">
              Join thousands of users who trust PricePredict for accurate commodity price forecasts
            </p>
            <button
              onClick={onGetStarted}
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-xl font-semibold text-lg transition-all duration-200 hover:shadow-2xl hover:shadow-emerald-500/50 hover:scale-105"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
              <span className="text-xl font-bold text-white">PricePredict</span>
            </div>
            <p className="text-slate-400 text-sm">
              © 2025 PricePredict. Accurate commodity price predictions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
