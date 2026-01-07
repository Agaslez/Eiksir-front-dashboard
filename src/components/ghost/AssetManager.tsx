/**
 * Asset Manager - Upload and manage media assets
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/cards';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Asset, assetsAPI } from '@/lib/ghost-api';
import { ExternalLink, Image as ImageIcon, Trash2, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';

const AssetManager = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [brandKitId, setBrandKitId] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (brandKitId) {
      loadAssets();
    }
  }, [brandKitId]);

  const loadAssets = async () => {
    if (!brandKitId) return;
    
    try {
      setLoading(true);
      const data = await assetsAPI.list(brandKitId);
      setAssets(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load assets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !brandKitId) return;

    try {
      setUploading(true);
      
      // Upload each file
      for (const file of Array.from(files)) {
        await assetsAPI.upload(file, brandKitId);
      }

      toast({
        title: 'Success',
        description: `Uploaded ${files.length} file(s) successfully`,
      });
      
      loadAssets();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload assets',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    
    try {
      await assetsAPI.delete(id);
      toast({ title: 'Success', description: 'Asset deleted successfully' });
      loadAssets();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete asset',
        variant: 'destructive',
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-500" />
            Upload Assets
          </CardTitle>
          <CardDescription>
            Upload images for your marketing campaigns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Brand Kit ID */}
          <div className="space-y-2">
            <Label htmlFor="brandKitId">Brand Kit ID *</Label>
            <div className="flex gap-2">
              <Input
                id="brandKitId"
                value={brandKitId}
                onChange={(e) => setBrandKitId(e.target.value)}
                placeholder="Enter brand kit ID"
              />
              <Button
                variant="outline"
                onClick={loadAssets}
                disabled={!brandKitId}
              >
                Load
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Note: In production, this would be a dropdown selector
            </p>
          </div>

          {/* File Upload */}
          {brandKitId && (
            <div className="space-y-2">
              <Label htmlFor="fileUpload">Upload Images</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="fileUpload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleUpload}
                  disabled={uploading}
                  className="cursor-pointer"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Supported formats: JPG, PNG, WebP. Max 10MB per file.
              </p>
            </div>
          )}

          {uploading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Uploading...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assets Grid */}
      {brandKitId && (
        <Card>
          <CardHeader>
            <CardTitle>Your Assets</CardTitle>
            <CardDescription>
              {assets.length} asset(s) in this brand kit
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading assets...</p>
              </div>
            ) : assets.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No assets yet</h3>
                <p className="text-muted-foreground">
                  Upload your first image to get started
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {assets.map((asset) => (
                  <Card key={asset.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video relative bg-gray-100 dark:bg-gray-800">
                      <img
                        src={asset.cloudinaryUrl}
                        alt={asset.filename}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <div>
                        <h4 className="font-medium text-sm truncate">{asset.filename}</h4>
                        <p className="text-xs text-muted-foreground">
                          {asset.width} × {asset.height} • {asset.format.toUpperCase()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(asset.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => window.open(asset.cloudinaryUrl, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(asset.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground truncate">
                          ID: {asset.id}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AssetManager;
