import { useState, useEffect } from 'react';
import { supabase, supabaseHelpers } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Database, Users, ShoppingCart, MessageSquare, Camera, Activity } from 'lucide-react';

interface DatabaseStats {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalMessages: number;
  totalPhotos: number;
  realtimeConnections: number;
}

export default function SupabaseDashboard() {
  const [stats, setStats] = useState<DatabaseStats>({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalMessages: 0,
    totalPhotos: 0,
    realtimeConnections: 0
  });
  
  const [realtimeData, setRealtimeData] = useState<any[]>([]);
  const queryClient = useQueryClient();

  // Real-time subscriptions for live data
  useEffect(() => {
    // Subscribe to products changes
    const productsSubscription = supabase
      .channel('products-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          console.log('Products change:', payload);
          queryClient.invalidateQueries({ queryKey: ['products'] });
          setRealtimeData(prev => [...prev, {
            type: 'products',
            event: payload.eventType,
            data: payload.new || payload.old,
            timestamp: new Date()
          }]);
        }
      )
      .subscribe();

    // Subscribe to fan photos changes
    const photosSubscription = supabase
      .channel('photos-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'fan_photos' },
        (payload) => {
          console.log('Photos change:', payload);
          queryClient.invalidateQueries({ queryKey: ['fan-photos'] });
          setRealtimeData(prev => [...prev, {
            type: 'fan_photos',
            event: payload.eventType,
            data: payload.new || payload.old,
            timestamp: new Date()
          }]);
        }
      )
      .subscribe();

    // Subscribe to contact messages
    const messagesSubscription = supabase
      .channel('messages-changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'contact_messages' },
        (payload) => {
          console.log('New message:', payload);
          queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
          setRealtimeData(prev => [...prev, {
            type: 'contact_messages',
            event: 'INSERT',
            data: payload.new,
            timestamp: new Date()
          }]);
        }
      )
      .subscribe();

    return () => {
      productsSubscription.unsubscribe();
      photosSubscription.unsubscribe();
      messagesSubscription.unsubscribe();
    };
  }, [queryClient]);

  // Fetch database statistics
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => supabaseHelpers.getProducts()
  });

  const { data: fanPhotos } = useQuery({
    queryKey: ['fan-photos'],
    queryFn: () => supabaseHelpers.getFanPhotos()
  });

  // Update stats when data changes
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      totalProducts: products?.length || 0,
      totalPhotos: fanPhotos?.length || 0
    }));
  }, [products, fanPhotos]);

  // Test real-time functionality
  const testRealtimeMutation = useMutation({
    mutationFn: async () => {
      // Track a test analytics event
      await supabaseHelpers.trackEvent('dashboard_test', {
        action: 'realtime_test',
        timestamp: new Date().toISOString()
      });
      return true;
    },
    onSuccess: () => {
      console.log('Real-time test triggered');
    }
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Supabase Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your real-time database and analytics
          </p>
        </div>
        <Button 
          onClick={() => testRealtimeMutation.mutate()}
          disabled={testRealtimeMutation.isPending}
        >
          <Activity className="w-4 h-4 mr-2" />
          Test Real-time
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMessages}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fan Photos</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPhotos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Real-time</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">LIVE</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Views */}
      <Tabs defaultValue="realtime" className="space-y-4">
        <TabsList>
          <TabsTrigger value="realtime">Real-time Events</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="photos">Fan Photos</TabsTrigger>
          <TabsTrigger value="database">Database Info</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Database Changes</CardTitle>
              <CardDescription>
                Real-time updates from your Supabase database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {realtimeData.slice().reverse().map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">
                        {event.type.replace('_', ' ')}
                      </Badge>
                      <Badge variant={event.event === 'INSERT' ? 'default' : 'secondary'}>
                        {event.event}
                      </Badge>
                      <span className="text-sm">
                        {event.data?.name || event.data?.id || 'Unknown'}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {event.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                ))}
                {realtimeData.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No real-time events yet. Make changes to see live updates!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Products Overview</CardTitle>
              <CardDescription>
                Live data from your products table
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {products?.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{product.price} AKZ</p>
                      <p className="text-sm text-muted-foreground">
                        Stock: {product.stockQuantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fan Photos</CardTitle>
              <CardDescription>
                Approved photos from your community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {fanPhotos?.map((photo) => (
                  <div key={photo.id} className="space-y-2">
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <Camera className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-center">{photo.caption || 'No caption'}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supabase Integration Status</CardTitle>
              <CardDescription>
                Connection and feature status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Database Connection</h4>
                  <Badge variant="default">Connected</Badge>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Real-time Subscriptions</h4>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Session Store</h4>
                  <Badge variant="default">PostgreSQL</Badge>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Authentication</h4>
                  <Badge variant="default">Supabase Ready</Badge>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Available Features</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>✅ Real-time database changes</div>
                  <div>✅ PostgreSQL session storage</div>
                  <div>✅ Automatic table creation</div>
                  <div>✅ Live analytics tracking</div>
                  <div>✅ File storage ready</div>
                  <div>✅ Row Level Security ready</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}