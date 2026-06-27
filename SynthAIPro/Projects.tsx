import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Plus, ArrowLeft, Trash2, Edit2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';

interface Project {
  id: number;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  priority: 'low' | 'medium' | 'high';
}

export default function Projects() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleAddProject = () => {
    if (!title.trim()) return;

    const newProject: Project = {
      id: Date.now(),
      title,
      description,
      status: 'active',
      priority: 'medium'
    };

    setProjects(prev => [...prev, newProject]);
    setTitle('');
    setDescription('');
    setShowForm(false);
  };

  const handleDeleteProject = (id: number) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'paused':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200/50 backdrop-blur-sm sticky top-0 z-40 bg-white/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
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
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <h1 className="text-xl font-bold text-slate-900">Projects & Commitments</h1>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Project Form */}
        {showForm && (
          <Card className="bg-white border-slate-200/50 rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Create New Project</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Project Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Launch new product feature"
                  className="rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add more details about this project..."
                  className="rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleAddProject}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg"
                >
                  Create Project
                </Button>
                <Button
                  onClick={() => setShowForm(false)}
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-lg"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Projects List */}
        {projects.length === 0 ? (
          <Card className="bg-white border-slate-200/50 rounded-2xl p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No Projects Yet</h2>
            <p className="text-slate-600 mb-6">Create your first project to start tracking commitments and goals.</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Project
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="bg-white border-slate-200/50 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">{project.title}</h3>
                    {project.description && (
                      <p className="text-sm text-slate-600">{project.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteProject(project.id)}
                    className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex gap-2 mb-4">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getPriorityColor(project.priority)}`}>
                    {project.priority}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Complete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
