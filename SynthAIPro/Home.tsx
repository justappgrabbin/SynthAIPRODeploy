import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, Zap, CheckCircle2, TrendingUp, ArrowRight } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-600">Loading SYNTHAI...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        {/* Header */}
        <div className="border-b border-slate-200/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-slate-900">SYNTHAI</span>
              <span className="text-lg">🪷</span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Your Personal AI Agent
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                SYNTHAI tracks your projects, follows up on commitments, and keeps things moving while you focus on what matters most.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => window.location.href = getLoginUrl()}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-lg"
                >
                  Learn More
                </Button>
              </div>
            </div>

            {/* Right: Visual */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl" />
              <Card className="relative bg-white/80 backdrop-blur-sm border-white/40 shadow-2xl rounded-3xl p-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">AI Chat</h3>
                      <p className="text-sm text-slate-600">Conversational AI that understands your goals</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Smart Tracking</h3>
                      <p className="text-sm text-slate-600">Automatically follow up on your commitments</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Personalized</h3>
                      <p className="text-sm text-slate-600">Customized based on your birth data and preferences</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white/50 backdrop-blur-sm border-t border-slate-200/50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">
              Powerful Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Zap,
                  title: "Instant Responses",
                  description: "Get quick, intelligent responses powered by advanced AI"
                },
                {
                  icon: CheckCircle2,
                  title: "Never Forget",
                  description: "Automatic reminders for your projects and commitments"
                },
                {
                  icon: TrendingUp,
                  title: "Stay Organized",
                  description: "Track progress and celebrate wins with your AI agent"
                }
              ].map((feature, idx) => (
                <Card key={idx} className="bg-white border-slate-200/50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                  <feature.icon className="w-8 h-8 text-blue-600 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to transform your productivity?
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              Join thousands of users who are already using SYNTHAI to achieve their goals
            </p>
            <Button
              size="lg"
              onClick={() => window.location.href = getLoginUrl()}
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold rounded-lg"
            >
              Start Free Today
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated home feed
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200/50 backdrop-blur-sm sticky top-0 z-40 bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-slate-900">SYNTHAI</span>
            <span className="text-lg">🪷</span>
          </div>
          <div className="text-sm text-slate-600">
            Welcome, {user?.name || 'User'}!
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-slate-200/50 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Welcome to SYNTHAI</h2>
              <p className="text-slate-600 mb-6">
                Your personal AI agent is ready to help you track projects, follow up on commitments, and achieve your goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => navigate('/chat')}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Start Chat
                </Button>
                <Button
                  onClick={() => navigate('/projects')}
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-lg"
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  View Projects
                </Button>
              </div>
            </Card>

            {/* Activity Feed Placeholder */}
            <Card className="bg-white border-slate-200/50 rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">Activity #{i}</p>
                      <p className="text-sm text-slate-600">No activities yet. Start by creating a project or chatting with SYNTHAI!</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="bg-white border-slate-200/50 rounded-2xl p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Active Projects</p>
                  <p className="text-2xl font-bold text-slate-900">0</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Completed This Week</p>
                  <p className="text-2xl font-bold text-slate-900">0</p>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200/50 rounded-2xl p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  onClick={() => navigate('/profile')}
                  variant="ghost"
                  className="w-full justify-start text-slate-700 hover:bg-white/50"
                >
                  Edit Profile
                </Button>
                <Button
                  onClick={() => navigate('/admin')}
                  variant="ghost"
                  className="w-full justify-start text-slate-700 hover:bg-white/50"
                >
                  Admin Panel
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
