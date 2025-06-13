import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
// Import only essential icons to reduce bundle size
import { 
  BarChart3, 
  Users, 
  Package, 
  ShoppingCart, 
  MessageSquare, 
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Settings,
  LogOut
} from "lucide-react";
import cucaLogoPath from "@/assets/cuca-logo.png";

interface AdminStats {
  totalProducts: number;
  activeProducts: number;
  totalCustomers: number;
  activeCustomers: number;
  totalOrders: number;
  pendingOrders: number;
  unreadMessages: number;
  totalRevenue: number;
}

export default function AdminPanel() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Acesso Negado",
        description: "Você precisa fazer login para acessar o painel administrativo.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch admin stats
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated,
  });

  // Fetch contact messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/contact-messages"],
    enabled: isAuthenticated,
  });

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/products"],
    enabled: isAuthenticated,
  });

  // Fetch customers
  const { data: customers = [], isLoading: customersLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/customers"],
    enabled: isAuthenticated,
  });

  // Fetch orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/orders"],
    enabled: isAuthenticated,
  });

  // Update message status mutation
  const updateMessageMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      return apiRequest(`/api/admin/contact-messages/${id}`, "PATCH", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contact-messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Sucesso",
        description: "Mensagem atualizada.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Sessão Expirada",
          description: "Fazendo login novamente...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro",
        description: "Falha ao atualizar mensagem.",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Modern Header with Glass Effect */}
      <div className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img 
                  src={cucaLogoPath} 
                  alt="CUCA Logo" 
                  className="h-12 w-12 object-contain"
                />
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-3 rounded-xl shadow-lg">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  CUCA Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-300">Central de administração inteligente</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = "/supabase"}
                className="hover:bg-white/20 flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">Supabase</span>
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = "/"}
                className="hover:bg-white/20 flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Voltar ao Site</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="relative hover:bg-white/20"
              >
                <MessageSquare className="h-5 w-5" />
                {stats && stats.unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {stats.unreadMessages}
                  </span>
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:bg-white/20"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  fetch('/api/auth/logout', { method: 'POST' })
                    .then(() => window.location.href = "/");
                }}
                className="bg-white/20 hover:bg-white/30 border-white/30"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Produtos Card */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-500/10 to-blue-600/20 hover:from-blue-500/20 hover:to-blue-600/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Produtos</p>
                    <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.activeProducts}</p>
                    <p className="text-xs text-blue-500/70 flex items-center mt-1">
                      <Package className="h-3 w-3 mr-1" />
                      {stats.totalProducts} total
                    </p>
                  </div>
                  <div className="bg-blue-500/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Clientes Card */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-500/10 to-green-600/20 hover:from-green-500/20 hover:to-green-600/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Clientes</p>
                    <p className="text-3xl font-bold text-green-700 dark:text-green-300">{stats.activeCustomers}</p>
                    <p className="text-xs text-green-500/70 flex items-center mt-1">
                      <Users className="h-3 w-3 mr-1" />
                      {stats.totalCustomers} total
                    </p>
                  </div>
                  <div className="bg-green-500/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pedidos Card */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-500/10 to-purple-600/20 hover:from-purple-500/20 hover:to-purple-600/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Pedidos</p>
                    <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{stats.totalOrders}</p>
                    <p className="text-xs text-purple-500/70 flex items-center mt-1">
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      {stats.pendingOrders} pendentes
                    </p>
                  </div>
                  <div className="bg-purple-500/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                    <ShoppingCart className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Receita Card */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-amber-500/10 to-orange-600/20 hover:from-amber-500/20 hover:to-orange-600/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Receita</p>
                    <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">
                      {new Intl.NumberFormat('pt-AO', {
                        style: 'currency',
                        currency: 'AOA'
                      }).format(stats.totalRevenue)}
                    </p>
                    <p className="text-xs text-amber-500/70 flex items-center mt-1">
                      <BarChart3 className="h-3 w-3 mr-1" />
                      +12% este mês
                    </p>
                  </div>
                  <div className="bg-amber-500/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                    <BarChart3 className="h-8 w-8 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card 
            className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-indigo-500/10 to-indigo-600/20 hover:from-indigo-500/20 hover:to-indigo-600/30"
            onClick={() => window.location.href = "/admin-galeria"}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300">Galeria dos Fãs</h3>
                  <p className="text-sm text-indigo-600/70 mt-1">Gerencie fotos enviadas pelos fãs</p>
                  <div className="flex items-center mt-3">
                    <Eye className="h-4 w-4 text-indigo-500 mr-1" />
                    <span className="text-xs text-indigo-500">Moderar conteúdo</span>
                  </div>
                </div>
                <div className="bg-indigo-500/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <Eye className="h-8 w-8 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/20 hover:from-emerald-500/20 hover:to-emerald-600/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">Clientes</h3>
                  <p className="text-sm text-emerald-600/70 mt-1">Visualize e gerencie clientes</p>
                  <div className="flex items-center mt-3">
                    <BarChart3 className="h-4 w-4 text-emerald-500 mr-1" />
                    <span className="text-xs text-emerald-500">{stats?.totalCustomers || 0} registrados</span>
                  </div>
                </div>
                <div className="bg-emerald-500/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-rose-500/10 to-rose-600/20 hover:from-rose-500/20 hover:to-rose-600/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-rose-700 dark:text-rose-300">Mensagens</h3>
                  <p className="text-sm text-rose-600/70 mt-1">Responder a contatos</p>
                  <div className="flex items-center mt-3">
                    <MessageSquare className="h-4 w-4 text-rose-500 mr-1" />
                    <span className="text-xs text-rose-500">{stats?.unreadMessages || 0} não lidas</span>
                  </div>
                </div>
                <div className="bg-rose-500/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-8 w-8 text-rose-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="messages" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <TabsTrigger value="messages" data-tab="messages" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">Mensagens</TabsTrigger>
            <TabsTrigger value="products" data-tab="products" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">Produtos</TabsTrigger>
            <TabsTrigger value="orders" data-tab="orders" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">Pedidos</TabsTrigger>
            <TabsTrigger value="customers" data-tab="customers" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">Clientes</TabsTrigger>
          </TabsList>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-4">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Mensagens de Contato
                </CardTitle>
                <CardDescription>
                  Mensagens enviadas pelos visitantes do site
                </CardDescription>
              </CardHeader>
              <CardContent>
                {messagesLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4 animate-pulse">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{message.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{message.email}</p>
                          </div>
                          <Badge variant={message.status === 'read' ? 'default' : 'destructive'}>
                            {message.status === 'read' ? 'Lida' : 'Não lida'}
                          </Badge>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-3">{message.message}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            {new Date(message.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                          {message.status === 'unread' && (
                            <Button
                              size="sm"
                              onClick={() => updateMessageMutation.mutate({ 
                                id: message.id, 
                                updates: { status: 'read' } 
                              })}
                              disabled={updateMessageMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Marcar como lida
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Nenhuma mensagem encontrada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Gestão de Produtos
                </CardTitle>
                <CardDescription>
                  Gerencie o catálogo de produtos CUCA
                </CardDescription>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48 animate-pulse"></div>
                    ))}
                  </div>
                ) : products.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{product.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{product.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-amber-600">
                            {new Intl.NumberFormat('pt-AO', {
                              style: 'currency',
                              currency: 'AOA'
                            }).format(product.price)}
                          </span>
                          <Badge variant={product.isActive ? 'default' : 'secondary'}>
                            {product.isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Nenhum produto encontrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Gestão de Pedidos
                </CardTitle>
                <CardDescription>
                  Acompanhe e gerencie pedidos dos clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4 animate-pulse">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Pedido #{order.id}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-amber-600">
                            {new Intl.NumberFormat('pt-AO', {
                              style: 'currency',
                              currency: 'AOA'
                            }).format(order.total)}
                          </span>
                          <span className="text-sm text-gray-500">{order.paymentStatus}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Nenhum pedido encontrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-4">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gestão de Clientes
                </CardTitle>
                <CardDescription>
                  Visualize e gerencie clientes registrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {customersLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4 animate-pulse">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : customers.length > 0 ? (
                  <div className="space-y-4">
                    {customers.map((customer) => (
                      <div key={customer.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{customer.username}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{customer.email}</p>
                          </div>
                          <Badge variant={customer.isActive ? 'default' : 'secondary'}>
                            {customer.isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500">
                          Registrado em: {new Date(customer.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Nenhum cliente encontrado</p>
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