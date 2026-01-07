/**
 * Schedule Calendar - View and manage scheduled posts
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/cards';
import { useToast } from '@/hooks/use-toast';
import { ScheduledPost, scheduledPostsAPI } from '@/lib/ghost-api';
import { Calendar, Clock, Plus, RefreshCw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import SchedulePostModal from './SchedulePostModal';

const ScheduleCalendar = () => {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{ status?: string }>({ status: 'scheduled' });
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPosts();
  }, [filter]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await scheduledPostsAPI.list(filter);
      setPosts(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load scheduled posts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this scheduled post?')) return;
    
    try {
      await scheduledPostsAPI.cancel(id);
      toast({ title: 'Success', description: 'Post cancelled successfully' });
      loadPosts();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel post',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: ScheduledPost['status']) => {
    const colors: Record<ScheduledPost['status'], string> = {
      scheduled: 'bg-blue-500',
      published: 'bg-green-500',
      failed: 'bg-red-500',
      cancelled: 'bg-gray-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUpcoming = (dateStr: string) => {
    return new Date(dateStr) > new Date();
  };

  const groupByDate = (posts: ScheduledPost[]) => {
    const groups: Record<string, ScheduledPost[]> = {};
    
    posts.forEach((post) => {
      const date = new Date(post.scheduledFor).toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(post);
    });

    return groups;
  };

  const groupedPosts = groupByDate(posts);

  return (
    <div className="space-y-4">
      {/* Header with Filters */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <select
            value={filter.status || ''}
            onChange={(e) => setFilter({ ...filter, status: e.target.value || undefined })}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <Button variant="outline" onClick={loadPosts}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Button onClick={() => setShowScheduleModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Post
        </Button>
      </div>

      {/* Calendar View */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading scheduled posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No scheduled posts</h3>
            <p className="text-muted-foreground mb-4">
              Schedule your first post to start automating your social media
            </p>
            <Button onClick={() => setShowScheduleModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedPosts).map(([date, datePosts]) => (
            <div key={date}>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {date}
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {datePosts
                  .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
                  .map((post) => (
                    <Card key={post.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                {new Date(post.scheduledFor).toLocaleTimeString('pl-PL', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <CardDescription>
                              {isUpcoming(post.scheduledFor) ? 'Upcoming' : 'Past'}
                            </CardDescription>
                          </div>
                          <Badge className={getStatusColor(post.status)}>
                            {post.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm line-clamp-3">{post.captionText}</p>

                        {post.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {post.hashtags.slice(0, 5).map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded"
                              >
                                #{tag}
                              </span>
                            ))}
                            {post.hashtags.length > 5 && (
                              <span className="text-xs text-muted-foreground">
                                +{post.hashtags.length - 5} more
                              </span>
                            )}
                          </div>
                        )}

                        {post.composedImageUrl && (
                          <img
                            src={post.composedImageUrl}
                            alt="Post preview"
                            className="w-full h-32 object-cover rounded-md"
                          />
                        )}

                        {post.failureReason && (
                          <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                            <strong>Error:</strong> {post.failureReason}
                          </div>
                        )}

                        {post.publishedAt && (
                          <div className="text-xs text-green-600 dark:text-green-400">
                            Published: {formatDate(post.publishedAt)}
                          </div>
                        )}

                        {post.status === 'scheduled' && isUpcoming(post.scheduledFor) && (
                          <div className="flex gap-2 pt-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancel(post.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Post Modal */}
      {showScheduleModal && (
        <SchedulePostModal
          onClose={() => setShowScheduleModal(false)}
          onSuccess={() => {
            loadPosts();
            setShowScheduleModal(false);
          }}
        />
      )}
    </div>
  );
};

export default ScheduleCalendar;
