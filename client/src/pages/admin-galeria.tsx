import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { galleryService, type GalleryPhoto } from "@/lib/galleryService";
import { CheckCircle, XCircle, Trash2, Clock, Image, Users, ArrowLeft } from "lucide-react";

export default function AdminGaleria() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Não autorizado",
        description: "Você precisa fazer login para acessar esta página.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Buscar todas as fotos
  const { data: allPhotos = [], isLoading: loadingAll } = useQuery<GalleryPhoto[]>({
    queryKey: ["/api/admin/fan-gallery"],
    queryFn: () => galleryService.getAllPhotos(),
    enabled: isAuthenticated,
  });

  // Buscar fotos pendentes
  const { data: pendingPhotos = [], isLoading: loadingPending } = useQuery<GalleryPhoto[]>({
    queryKey: ["/api/admin/fan-gallery/pending"],
    queryFn: () => galleryService.getPendingPhotos(),
    enabled: isAuthenticated,
  });

  // Mutation para aprovar foto
  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      return galleryService.approvePhoto(id);
    },
    onSuccess: () => {
      toast({
        title: "Foto aprovada",
        description: "A foto foi aprovada e está visível na galeria pública.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/fan-gallery"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/fan-gallery/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/fan-gallery"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "Você foi desconectado. Fazendo login novamente...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro ao aprovar",
        description: "Não foi possível aprovar a foto.",
        variant: "destructive",
      });
    },
  });

  // Mutation para rejeitar foto
  const rejectMutation = useMutation({
    mutationFn: async (id: number) => {
      return galleryService.rejectPhoto(id);
    },
    onSuccess: () => {
      toast({
        title: "Foto rejeitada",
        description: "A foto foi rejeitada.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/fan-gallery"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/fan-gallery/pending"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "Você foi desconectado. Fazendo login novamente...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro ao rejeitar",
        description: "Não foi possível rejeitar a foto.",
        variant: "destructive",
      });
    },
  });

  // Mutation para deletar foto
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return galleryService.deletePhoto(id);
    },
    onSuccess: () => {
      toast({
        title: "Foto removida",
        description: "A foto foi removida permanentemente.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/fan-gallery"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/fan-gallery/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/fan-gallery"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "Você foi desconectado. Fazendo login novamente...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover a foto.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Aprovada</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700"><XCircle className="h-3 w-3 mr-1" />Rejeitada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "-";
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="outline"
            onClick={() => window.location.href = "/admin"}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Painel
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Galeria dos Fãs - Administração
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gerencie as fotos enviadas pelos fãs da CUCA
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Image className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Fotos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {allPhotos.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {pendingPhotos.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aprovadas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {allPhotos.filter(p => p.status === "approved").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejeitadas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {allPhotos.filter(p => p.status === "rejected").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fotos pendentes */}
      {pendingPhotos.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Fotos Pendentes de Aprovação ({pendingPhotos.length})
            </CardTitle>
            <CardDescription>
              Estas fotos estão aguardando sua aprovação para aparecer na galeria pública
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingPhotos.map((photo) => (
                <Card key={photo.id} className="border-yellow-200">
                  <CardContent className="p-4">
                    <img
                      src={photo.imageData}
                      alt={photo.caption}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{photo.name}</p>
                        {getStatusBadge(photo.status)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{photo.caption}</p>
                      <p className="text-xs text-gray-500">
                        Enviada em: {formatDate(photo.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        onClick={() => approveMutation.mutate(photo.id)}
                        disabled={approveMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rejectMutation.mutate(photo.id)}
                        disabled={rejectMutation.isPending}
                        className="border-red-300 text-red-600 hover:bg-red-50 flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Rejeitar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Todas as fotos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Todas as Fotos ({allPhotos.length})
          </CardTitle>
          <CardDescription>
            Histórico completo de todas as fotos enviadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingAll ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : allPhotos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allPhotos.map((photo) => (
                <Card key={photo.id}>
                  <CardContent className="p-4">
                    <img
                      src={photo.imageData}
                      alt={photo.caption}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{photo.name}</p>
                        {getStatusBadge(photo.status)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{photo.caption}</p>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>Enviada: {formatDate(photo.createdAt)}</p>
                        {photo.approvedAt && (
                          <p>Aprovada: {formatDate(photo.approvedAt)}</p>
                        )}
                        {photo.approvedBy && (
                          <p>Por: {photo.approvedBy}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      {photo.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => approveMutation.mutate(photo.id)}
                            disabled={approveMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectMutation.mutate(photo.id)}
                            disabled={rejectMutation.isPending}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rejeitar
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteMutation.mutate(photo.id)}
                        disabled={deleteMutation.isPending}
                        className="border-red-300 text-red-600 hover:bg-red-50 ml-auto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Nenhuma foto foi enviada ainda.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}