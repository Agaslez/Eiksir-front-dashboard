/**
 * Schedule Post Modal - Form for scheduling new posts
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Asset, assetsAPI, scheduledPostsAPI, Template, templatesAPI } from '@/lib/ghost-api';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SchedulePostModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const SchedulePostModal = ({ onClose, onSuccess }: SchedulePostModalProps) => {
  const [formData, setFormData] = useState({
    assetId: '',
    brandKitId: '',
    templateId: '',
    scheduledFor: '',
    captionText: '',
    hashtags: '',
  });
  const [assets, setAssets] = useState<Asset[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load templates
      const templatesData = await templatesAPI.list({ status: 'active' });
      setTemplates(templatesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const loadAssets = async (brandKitId: string) => {
    try {
      const assetsData = await assetsAPI.list(brandKitId);
      setAssets(assetsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load assets',
        variant: 'destructive',
      });
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setFormData({
        ...formData,
        templateId,
        captionText: template.captionTemplate,
        hashtags: template.hashtags.join(', '),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.assetId || !formData.brandKitId || !formData.scheduledFor || !formData.captionText) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Check if date is in the past
    const scheduledDate = new Date(formData.scheduledFor);
    const now = new Date();
    if (scheduledDate < now) {
      toast({
        title: 'Validation Error',
        description: 'Cannot schedule posts in the past',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      // Parse hashtags
      const hashtagsArray = formData.hashtags
        .split(',')
        .map((tag) => tag.trim().replace(/^#/, ''))
        .filter((tag) => tag.length > 0);

      await scheduledPostsAPI.schedule({
        assetId: formData.assetId,
        brandKitId: formData.brandKitId,
        scheduledFor: new Date(formData.scheduledFor).toISOString(),
        captionText: formData.captionText,
        hashtags: hashtagsArray,
        ...(formData.templateId && { templateId: formData.templateId }),
      });

      toast({
        title: 'Success',
        description: 'Post scheduled successfully',
      });
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to schedule post',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Get min datetime (current time + 2 minutes buffer)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 2);
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Schedule New Post</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Template Selection (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="templateId">Use Template (Optional)</Label>
            <select
              id="templateId"
              value={formData.templateId}
              onChange={(e) => handleTemplateSelect(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="">-- Select a template --</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.type})
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Optional: Load caption and hashtags from a template
            </p>
          </div>

          {/* Brand Kit ID (Note: In production, this would be a dropdown) */}
          <div className="space-y-2">
            <Label htmlFor="brandKitId">Brand Kit ID *</Label>
            <Input
              id="brandKitId"
              value={formData.brandKitId}
              onChange={(e) => {
                setFormData({ ...formData, brandKitId: e.target.value });
                if (e.target.value) {
                  loadAssets(e.target.value);
                }
              }}
              placeholder="Enter brand kit ID"
              required
            />
            <p className="text-xs text-muted-foreground">
              Note: In production, this would be a dropdown selector
            </p>
          </div>

          {/* Asset Selection */}
          <div className="space-y-2">
            <Label htmlFor="assetId">Asset *</Label>
            {assets.length > 0 ? (
              <select
                id="assetId"
                value={formData.assetId}
                onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
                required
              >
                <option value="">-- Select an asset --</option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.filename} ({asset.width}x{asset.height})
                  </option>
                ))}
              </select>
            ) : (
              <Input
                id="assetId"
                value={formData.assetId}
                onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                placeholder="Enter asset ID"
                required
              />
            )}
          </div>

          {/* Scheduled Date/Time */}
          <div className="space-y-2">
            <Label htmlFor="scheduledFor">Schedule For *</Label>
            <Input
              id="scheduledFor"
              type="datetime-local"
              value={formData.scheduledFor}
              onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
              min={getMinDateTime()}
              required
            />
            <p className="text-xs text-muted-foreground">
              Select date and time for posting (must be in the future)
            </p>
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="captionText">Caption *</Label>
            <Textarea
              id="captionText"
              value={formData.captionText}
              onChange={(e) => setFormData({ ...formData, captionText: e.target.value })}
              placeholder="Write your post caption..."
              rows={6}
              required
            />
          </div>

          {/* Hashtags */}
          <div className="space-y-2">
            <Label htmlFor="hashtags">Hashtags</Label>
            <Input
              id="hashtags"
              value={formData.hashtags}
              onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
              placeholder="EliksirBar, Koktajle, Event (comma separated)"
            />
            <p className="text-xs text-muted-foreground">
              Enter hashtags separated by commas (# symbols will be added automatically)
            </p>
          </div>

          {/* Preview */}
          {formData.captionText && (
            <div className="space-y-2 p-4 bg-accent rounded-lg">
              <Label>Preview</Label>
              <div className="text-sm whitespace-pre-wrap">
                {formData.captionText}
              </div>
              {formData.hashtags && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.hashtags.split(',').map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded"
                    >
                      #{tag.trim().replace(/^#/, '')}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Scheduling...' : 'Schedule Post'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SchedulePostModal;
