/**
 * Template Library - Browse and manage content templates
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/cards';
import { useToast } from '@/hooks/use-toast';
import { Template, templatesAPI } from '@/lib/ghost-api';
import { Edit, FileText, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import CreateTemplateModal from './CreateTemplateModal';

const TemplateLibrary = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{ type?: string; status?: string }>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, [filter]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await templatesAPI.list(filter);
      setTemplates(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load templates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      await templatesAPI.delete(id);
      toast({ title: 'Success', description: 'Template deleted successfully' });
      loadTemplates();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive',
      });
    }
  };

  const getTypeColor = (type: Template['type']) => {
    const colors: Record<Template['type'], string> = {
      daily: 'bg-blue-500',
      weekly: 'bg-green-500',
      event: 'bg-purple-500',
      promotion: 'bg-orange-500',
      announcement: 'bg-yellow-500',
      custom: 'bg-gray-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  const getStatusColor = (status: Template['status']) => {
    const colors: Record<Template['status'], string> = {
      active: 'bg-green-500',
      inactive: 'bg-gray-500',
      archived: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className="space-y-4">
      {/* Header with Filters */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <select
            value={filter.type || ''}
            onChange={(e) => setFilter({ ...filter, type: e.target.value || undefined })}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="">All Types</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="event">Event</option>
            <option value="promotion">Promotion</option>
            <option value="announcement">Announcement</option>
            <option value="custom">Custom</option>
          </select>

          <select
            value={filter.status || ''}
            onChange={(e) => setFilter({ ...filter, status: e.target.value || undefined })}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading templates...</p>
        </div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-4">
              Create your first template to get started
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="mt-1">
                      Created {new Date(template.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Badge className={getStatusColor(template.status)}>
                      {template.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Badge className={getTypeColor(template.type)}>
                    {template.type}
                  </Badge>
                  <Badge variant="outline" className="ml-2">
                    {template.brandVoice}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-3">
                  {template.captionTemplate}
                </p>

                {template.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {template.hashtags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                    {template.hashtags.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{template.hashtags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <CreateTemplateModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            loadTemplates();
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

export default TemplateLibrary;
