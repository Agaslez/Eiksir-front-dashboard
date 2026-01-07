/**
 * Create Template Modal - Form for creating new content templates
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Template, templatesAPI } from '@/lib/ghost-api';
import { X } from 'lucide-react';
import { useState } from 'react';

interface CreateTemplateModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateTemplateModal = ({ onClose, onSuccess }: CreateTemplateModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'custom' as Template['type'],
    captionTemplate: '',
    brandVoice: 'friendly' as Template['brandVoice'],
    hashtags: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Template name is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.captionTemplate.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Caption template is required',
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

      await templatesAPI.create({
        name: formData.name,
        type: formData.type,
        captionTemplate: formData.captionTemplate,
        brandVoice: formData.brandVoice,
        hashtags: hashtagsArray,
      });

      toast({
        title: 'Success',
        description: 'Template created successfully',
      });
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create template',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Create New Template</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Template Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Daily Promotion Template"
              maxLength={100}
              required
            />
            <p className="text-xs text-muted-foreground">
              {formData.name.length}/100 characters
            </p>
          </div>

          {/* Template Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Template Type *</Label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Template['type'] })}
              className="w-full px-3 py-2 border rounded-md bg-background"
              required
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="event">Event</option>
              <option value="promotion">Promotion</option>
              <option value="announcement">Announcement</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Brand Voice */}
          <div className="space-y-2">
            <Label htmlFor="brandVoice">Brand Voice *</Label>
            <select
              id="brandVoice"
              value={formData.brandVoice}
              onChange={(e) => setFormData({ ...formData, brandVoice: e.target.value as Template['brandVoice'] })}
              className="w-full px-3 py-2 border rounded-md bg-background"
              required
            >
              <option value="friendly">Friendly</option>
              <option value="professional">Professional</option>
              <option value="playful">Playful</option>
              <option value="luxurious">Luxurious</option>
            </select>
          </div>

          {/* Caption Template */}
          <div className="space-y-2">
            <Label htmlFor="captionTemplate">Caption Template *</Label>
            <Textarea
              id="captionTemplate"
              value={formData.captionTemplate}
              onChange={(e) => setFormData({ ...formData, captionTemplate: e.target.value })}
              placeholder="Enter your caption template. Use {{placeholders}} for dynamic content.&#10;Example: Dzisiaj specjalna promocja na {{product}}! 🎉"
              rows={6}
              maxLength={1000}
              required
            />
            <p className="text-xs text-muted-foreground">
              {formData.captionTemplate.length}/1000 characters
            </p>
            <p className="text-xs text-blue-500">
              Tip: Use {'{{placeholders}}'} for dynamic content like {'{{product}}'}, {'{{date}}'}, {'{{discount}}'}
            </p>
          </div>

          {/* Hashtags */}
          <div className="space-y-2">
            <Label htmlFor="hashtags">Hashtags (Optional)</Label>
            <Input
              id="hashtags"
              value={formData.hashtags}
              onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
              placeholder="EliksirBar, Koktajle, WeseleWPalace (comma separated, max 10)"
            />
            <p className="text-xs text-muted-foreground">
              Enter hashtags separated by commas (# symbols will be added automatically)
            </p>
          </div>

          {/* Preview */}
          {formData.captionTemplate && (
            <div className="space-y-2 p-4 bg-accent rounded-lg">
              <Label>Preview</Label>
              <div className="text-sm whitespace-pre-wrap">
                {formData.captionTemplate}
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
              {loading ? 'Creating...' : 'Create Template'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTemplateModal;
