import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Settings, Plus, Trash2, Upload, Network, Brain } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Scaffolding {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
}

interface Integration {
  id: number;
  name: string;
  type: string;
  enabled: boolean;
}

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [scaffoldings, setScaffoldings] = useState<Scaffolding[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [showScaffoldingForm, setShowScaffoldingForm] = useState(false);
  const [scaffoldingName, setScaffoldingName] = useState('');
  const [scaffoldingDesc, setScaffoldingDesc] = useState('');

  // Redirect if not admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="bg-white border-slate-200/50 rounded-2xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-6">You don't have permission to access the admin panel.</p>
          <Button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg"
          >
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  const handleAddScaffolding = () => {
    if (!scaffoldingName.trim()) return;

    const newScaffolding: Scaffolding = {
      id: Date.now(),
      name: scaffoldingName,
      description: scaffoldingDesc,
      enabled: true
    };

    setScaffoldings(prev => [...prev, newScaffolding]);
    setScaffoldingName('');
    setScaffoldingDesc('');
    setShowScaffoldingForm(false);
  };

  const handleDeleteScaffolding = (id: number) => {
    setScaffoldings(prev => prev.filter(s => s.id !== id));
  };

  const handleToggleScaffolding = (id: number) => {
    setScaffoldings(prev =>
      prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s)
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200/50 backdrop-blur-sm sticky top-0 z-40 bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
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
              <Settings className="w-6 h-6 text-purple-600" />
              <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="scaffolding" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="scaffolding">Scaffolding</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="neural">Neural Network</TabsTrigger>
          </TabsList>

          {/* Scaffolding Tab */}
          <TabsContent value="scaffolding" className="space-y-6">
            <Card className="bg-white border-slate-200/50 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Scaffolding Manager</h2>
                <Button
                  onClick={() => setShowScaffoldingForm(!showScaffoldingForm)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Scaffolding
                </Button>
              </div>

              {showScaffoldingForm && (
                <div className="bg-slate-50 rounded-lg p-6 mb-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                    <Input
                      value={scaffoldingName}
                      onChange={(e) => setScaffoldingName(e.target.value)}
                      placeholder="e.g., SuperBass Integration"
                      className="rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                    <Input
                      value={scaffoldingDesc}
                      onChange={(e) => setScaffoldingDesc(e.target.value)}
                      placeholder="Describe this scaffolding configuration..."
                      className="rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleAddScaffolding}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg"
                    >
                      Create
                    </Button>
                    <Button
                      onClick={() => setShowScaffoldingForm(false)}
                      variant="outline"
                      className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-lg"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {scaffoldings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-600 mb-4">No scaffolding configurations yet.</p>
                  <Button
                    onClick={() => setShowScaffoldingForm(true)}
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create First Scaffolding
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {scaffoldings.map((scaffolding) => (
                    <div key={scaffolding.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{scaffolding.name}</h3>
                        <p className="text-sm text-slate-600">{scaffolding.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={scaffolding.enabled}
                            onChange={() => handleToggleScaffolding(scaffolding.id)}
                            className="rounded border-slate-300"
                          />
                          <span className="text-sm text-slate-600">{scaffolding.enabled ? 'Enabled' : 'Disabled'}</span>
                        </label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteScaffolding(scaffolding.id)}
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <Card className="bg-white border-slate-200/50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">App Integrations</h2>
              <p className="text-slate-600 mb-6">Connect third-party applications like SuperBass and other services.</p>
              <div className="space-y-4">
                {[
                  { name: 'SuperBass', type: 'music' },
                  { name: 'Calendar Sync', type: 'calendar' },
                  { name: 'Email Integration', type: 'email' }
                ].map((integration, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div>
                      <h3 className="font-semibold text-slate-900">{integration.name}</h3>
                      <p className="text-sm text-slate-600">Type: {integration.type}</p>
                    </div>
                    <Button
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg"
                    >
                      Configure
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-6">
            <Card className="bg-white border-slate-200/50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">File Manager</h2>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-2">Drag and drop files here or click to upload</p>
                <p className="text-sm text-slate-500">Supported: Documents, configs, media files</p>
              </div>
              <div className="mt-8">
                <h3 className="font-semibold text-slate-900 mb-4">Uploaded Files</h3>
                <p className="text-slate-600">No files uploaded yet.</p>
              </div>
            </Card>
          </TabsContent>

          {/* Neural Network Tab */}
          <TabsContent value="neural" className="space-y-6">
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200/50 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Brain className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-slate-900">Self-Editing Neural Network</h2>
              </div>
              <p className="text-slate-600 mb-6">
                Manage the AI's knowledge base and allow it to suggest and apply updates to its own behavior rules.
              </p>

              <div className="space-y-4">
                <div className="bg-white rounded-lg p-6 border border-purple-200">
                  <h3 className="font-semibold text-slate-900 mb-2">Knowledge Base Rules</h3>
                  <p className="text-sm text-slate-600 mb-4">Total active rules: 0</p>
                  <Button
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-lg"
                  >
                    View All Rules
                  </Button>
                </div>

                <div className="bg-white rounded-lg p-6 border border-purple-200">
                  <h3 className="font-semibold text-slate-900 mb-2">Pending Rule Updates</h3>
                  <p className="text-sm text-slate-600 mb-4">AI-suggested improvements waiting for approval: 0</p>
                  <Button
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-lg"
                  >
                    Review Updates
                  </Button>
                </div>

                <div className="bg-white rounded-lg p-6 border border-purple-200">
                  <h3 className="font-semibold text-slate-900 mb-2">Mesh Network Status</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <p className="text-sm text-slate-600">All agents online</p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-lg"
                  >
                    <Network className="w-4 h-4 mr-2" />
                    View Network
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
