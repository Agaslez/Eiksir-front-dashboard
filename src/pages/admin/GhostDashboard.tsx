/**
 * GHOST Dashboard - Main Marketing Automation Hub
 */

import AssetManager from '@/components/ghost/AssetManager';
import CaptionGenerator from '@/components/ghost/CaptionGenerator';
import ScheduleCalendar from '@/components/ghost/ScheduleCalendar';
import TemplateLibrary from '@/components/ghost/TemplateLibrary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/cards';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, FileText, Image, Sparkles, Wand2 } from 'lucide-react';
import { useState } from 'react';

const GhostDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-purple-500" />
            GHOST Marketing Bot
          </h1>
          <p className="text-muted-foreground mt-1">
            Automated Social Media Content Creation & Scheduling
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      {activeTab === 'overview' && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled Posts</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">Next: Today at 18:00</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assets Uploaded</CardTitle>
              <Image className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">+18 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Generations</CardTitle>
              <Wand2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">+23 this week</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="captions">AI Captions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks to get started with GHOST
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <button
                onClick={() => setActiveTab('templates')}
                className="p-4 border rounded-lg hover:bg-accent transition-colors text-left"
              >
                <FileText className="h-8 w-8 mb-2 text-blue-500" />
                <h3 className="font-semibold">Create Template</h3>
                <p className="text-sm text-muted-foreground">
                  Design reusable content templates
                </p>
              </button>

              <button
                onClick={() => setActiveTab('schedule')}
                className="p-4 border rounded-lg hover:bg-accent transition-colors text-left"
              >
                <Calendar className="h-8 w-8 mb-2 text-green-500" />
                <h3 className="font-semibold">Schedule Post</h3>
                <p className="text-sm text-muted-foreground">
                  Plan your content calendar
                </p>
              </button>

              <button
                onClick={() => setActiveTab('assets')}
                className="p-4 border rounded-lg hover:bg-accent transition-colors text-left"
              >
                <Image className="h-8 w-8 mb-2 text-purple-500" />
                <h3 className="font-semibold">Upload Assets</h3>
                <p className="text-sm text-muted-foreground">
                  Add images for your posts
                </p>
              </button>

              <button
                onClick={() => setActiveTab('captions')}
                className="p-4 border rounded-lg hover:bg-accent transition-colors text-left"
              >
                <Wand2 className="h-8 w-8 mb-2 text-orange-500" />
                <h3 className="font-semibold">Generate Caption</h3>
                <p className="text-sm text-muted-foreground">
                  AI-powered content creation
                </p>
              </button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <TemplateLibrary />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <ScheduleCalendar />
        </TabsContent>

        <TabsContent value="assets" className="space-y-4">
          <AssetManager />
        </TabsContent>

        <TabsContent value="captions" className="space-y-4">
          <CaptionGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GhostDashboard;
