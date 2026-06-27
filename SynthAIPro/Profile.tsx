import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { User, ArrowLeft, Save, LogOut } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';

export default function Profile() {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    // TODO: Call tRPC mutation to save profile
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200/50 backdrop-blur-sm sticky top-0 z-40 bg-white/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-slate-600 hover:bg-slate-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <User className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-slate-900">Profile Settings</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="bg-white border-slate-200/50 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="your@email.com"
                    className="rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </Card>

            {/* Birthday Personalization */}
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200/50 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Birthday Personalization</h2>
              <p className="text-sm text-slate-600 mb-6">
                Share your birth details so SYNTHAI can personalize your experience based on astrology and numerology.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Birth Date</label>
                  <Input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Birth Time</label>
                  <Input
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className="rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Birth Place</label>
                  <Input
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                    placeholder="City, Country"
                    className="rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </Card>

            {/* Save Button */}
            <div className="flex gap-3">
              <Button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg"
              >
                <Save className="w-5 h-5 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-lg"
              >
                Cancel
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Info */}
            <Card className="bg-white border-slate-200/50 rounded-2xl p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Account</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-600">Member Since</p>
                  <p className="font-medium text-slate-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600">Account Type</p>
                  <p className="font-medium text-slate-900 capitalize">{user?.role || 'User'}</p>
                </div>
              </div>
            </Card>

            {/* Personalization Info */}
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200/50 rounded-2xl p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Your Astrology</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-600">Zodiac Sign</p>
                  <p className="font-medium text-slate-900">{user?.zodiacSign || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-slate-600">Life Path Number</p>
                  <p className="font-medium text-slate-900">{user?.lifePathNumber || 'Not set'}</p>
                </div>
              </div>
            </Card>

            {/* Logout */}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-red-300 text-red-700 hover:bg-red-50 font-semibold rounded-lg"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
