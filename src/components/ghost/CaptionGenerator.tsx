/**
 * Caption Generator - AI-powered content creation
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/cards';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Caption, captionAPI } from '@/lib/ghost-api';
import { Copy, RefreshCw, Sparkles, Wand2 } from 'lucide-react';
import { useState } from 'react';

const CaptionGenerator = () => {
  const [formData, setFormData] = useState({
    assetName: '',
    brandName: 'Eliksir Bar',
    brandVoice: 'friendly' as const,
    captionType: 'promotion' as const,
    tags: '',
    targetAudience: '',
    callToAction: '',
  });
  const [result, setResult] = useState<Caption | null>(null);
  const [provider, setProvider] = useState<string>('');
  const [generationTime, setGenerationTime] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.assetName || !formData.brandName) {
      toast({
        title: 'Validation Error',
        description: 'Asset name and brand name are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      setResult(null);
      
      // Parse tags
      const tagsArray = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const response = await captionAPI.generate({
        assetName: formData.assetName,
        brandName: formData.brandName,
        brandVoice: formData.brandVoice,
        captionType: formData.captionType,
        ...(tagsArray.length > 0 && { tags: tagsArray }),
        ...(formData.targetAudience && { targetAudience: formData.targetAudience }),
        ...(formData.callToAction && { callToAction: formData.callToAction }),
      });

      if (response.success && response.caption) {
        setResult(response.caption);
        setProvider(response.provider || 'unknown');
        setGenerationTime(response.generationTime || 0);
        toast({
          title: 'Success',
          description: `Caption generated using ${response.provider === 'ai' ? 'AI' : 'template'} in ${response.generationTime}ms`,
        });
      } else {
        throw new Error(response.error || 'Failed to generate caption');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate caption',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Caption copied to clipboard',
    });
  };

  const handleCopyAll = () => {
    if (!result) return;
    
    const fullText = `${result.text}\n\n${result.hashtags.map((tag) => `#${tag}`).join(' ')}${
      result.cta ? `\n\n${result.cta}` : ''
    }`;
    
    navigator.clipboard.writeText(fullText);
    toast({
      title: 'Copied',
      description: 'Full caption with hashtags copied to clipboard',
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Caption Generator
          </CardTitle>
          <CardDescription>
            Generate engaging social media captions powered by AI (DeepSeek R1 + GPT-4o-mini)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Asset Name */}
              <div className="space-y-2">
                <Label htmlFor="assetName">Asset Name *</Label>
                <Input
                  id="assetName"
                  value={formData.assetName}
                  onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                  placeholder="e.g., cocktail-bar-event.jpg"
                  required
                />
              </div>

              {/* Brand Name */}
              <div className="space-y-2">
                <Label htmlFor="brandName">Brand Name *</Label>
                <Input
                  id="brandName"
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  placeholder="e.g., Eliksir Bar"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Brand Voice */}
              <div className="space-y-2">
                <Label htmlFor="brandVoice">Brand Voice *</Label>
                <select
                  id="brandVoice"
                  value={formData.brandVoice}
                  onChange={(e) => setFormData({ ...formData, brandVoice: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  required
                >
                  <option value="friendly">Friendly</option>
                  <option value="professional">Professional</option>
                  <option value="playful">Playful</option>
                  <option value="luxurious">Luxurious</option>
                </select>
              </div>

              {/* Caption Type */}
              <div className="space-y-2">
                <Label htmlFor="captionType">Caption Type *</Label>
                <select
                  id="captionType"
                  value={formData.captionType}
                  onChange={(e) => setFormData({ ...formData, captionType: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  required
                >
                  <option value="promotion">Promotion</option>
                  <option value="event">Event</option>
                  <option value="announcement">Announcement</option>
                  <option value="product">Product</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (Optional)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="wesele, koktajle, event (comma separated)"
              />
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience (Optional)</Label>
              <Input
                id="targetAudience"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                placeholder="e.g., młode pary planujące wesele"
              />
            </div>

            {/* Call to Action */}
            <div className="space-y-2">
              <Label htmlFor="callToAction">Call to Action (Optional)</Label>
              <Input
                id="callToAction"
                value={formData.callToAction}
                onChange={(e) => setFormData({ ...formData, callToAction: e.target.value })}
                placeholder="e.g., Zarezerwuj termin już dziś!"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Caption
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Caption</CardTitle>
              <div className="flex gap-2">
                <span className="text-xs text-muted-foreground">
                  {provider === 'ai' ? '🤖 AI Generated' : '📝 Template'} • {generationTime}ms
                </span>
                <Button variant="outline" size="sm" onClick={handleCopyAll}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Caption Text */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Caption Text</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(result.text)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                value={result.text}
                readOnly
                rows={4}
                className="bg-accent"
              />
            </div>

            {/* Hashtags */}
            {result.hashtags.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Hashtags</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(result.hashtags.map((tag) => `#${tag}`).join(' '))}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 p-3 bg-accent rounded-md">
                  {result.hashtags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            {result.cta && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Call to Action</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(result.cta!)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-3 bg-accent rounded-md text-sm font-semibold">
                  {result.cta}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CaptionGenerator;
