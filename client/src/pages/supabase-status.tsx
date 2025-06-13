import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  Activity, 
  Users, 
  Package, 
  MessageSquare,
  Camera,
  RefreshCw,
  ExternalLink
} from "lucide-react";

export default function SupabaseStatus() {
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ["/api/supabase/stats"],
    retry: false,
  });

  const { data: products } = useQuery({
    queryKey: ["/api/supabase/products"],
    retry: false,
  });

  const { data: fanPhotos } = useQuery({
    queryKey: ["/api/supabase/fan-gallery"],
    retry: false,
  });

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cuca-red/5 to-cuca-yellow/5 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="h-8 w-8 text-cuca-red" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Supabase Dashboard</h1>
              <p className="text-muted-foreground">Monitoramento da migração para Supabase</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href="/admin" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Admin
              </a>
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Conexão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="default" className="bg-green-100 text-green-800">
                Conectado
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-cuca-red" />
                Produtos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.activeProducts || 0} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCustomers || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.activeCustomers || 0} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Camera className="h-4 w-4 text-purple-500" />
                Galeria de Fãs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalFanPhotos || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.pendingFanPhotos || 0} pendentes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="gallery">Galeria</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Estatísticas Gerais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Produtos Totais:</span>
                    <span className="font-semibold">{stats?.totalProducts || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Clientes Ativos:</span>
                    <span className="font-semibold">{stats?.activeCustomers || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pedidos:</span>
                    <span className="font-semibold">{stats?.totalOrders || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mensagens:</span>
                    <span className="font-semibold">{stats?.unreadMessages || 0} não lidas</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Mensagens
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Não lidas:</span>
                    <Badge variant="destructive">{stats?.unreadMessages || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Pendentes:</span>
                    <Badge variant="secondary">{stats?.pendingOrders || 0}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Receita Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats?.totalRevenue ? `$${stats.totalRevenue.toFixed(2)}` : '$0.00'}
                  </div>
                  <p className="text-xs text-muted-foreground">Pedidos completados</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Produtos do Supabase</CardTitle>
                <CardDescription>
                  Produtos carregados diretamente do Supabase
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p>Carregando produtos...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products?.map((product: any) => (
                      <Card key={product.id}>
                        <CardContent className="p-4">
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {product.description?.slice(0, 100)}...
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-cuca-red">
                              ${parseFloat(product.price).toFixed(2)}
                            </span>
                            <Badge variant={product.is_active ? "default" : "secondary"}>
                              {product.is_active ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Galeria de Fãs</CardTitle>
                <CardDescription>
                  Fotos aprovadas carregadas do Supabase
                </CardDescription>
              </CardHeader>
              <CardContent>
                {fanPhotos && fanPhotos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {fanPhotos.slice(0, 6).map((photo: any) => (
                      <Card key={photo.id}>
                        <CardContent className="p-4">
                          <div className="aspect-square bg-gray-100 rounded mb-2 flex items-center justify-center">
                            <Camera className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-sm font-medium">
                            {photo.username || 'Usuário anônimo'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {photo.caption?.slice(0, 50)}...
                          </p>
                          <Badge className="mt-2" variant="default">
                            {photo.status}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-muted-foreground">Nenhuma foto encontrada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}