import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Camera, Upload, Heart, Star, ArrowLeft, Clock, CheckCircle, XCircle } from "lucide-react";
import type { FanPhoto, InsertFanPhoto } from "@shared/schema";

export default function GaleriaFas() {
  const [formData, setFormData] = useState({
    name: "",
    caption: "",
    imageUrl: ""
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Helper function to get image source safely
  const getImageSrc = (photo: FanPhoto): string => {
    return photo.imageUrl || photo.imageData || '';
  };

  // Verificação de autenticação
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Acesso negado",
        description: "Você precisa estar logado para acessar a galeria de fãs.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Buscar fotos aprovadas
  const { data: approvedPhotos = [], isLoading } = useQuery<FanPhoto[]>({
    queryKey: ["/api/fan-gallery"],
  });

  // Buscar minhas fotos enviadas
  const { data: myPhotos = [] } = useQuery<FanPhoto[]>({
    queryKey: ["/api/user/my-photos"],
    enabled: isAuthenticated,
  });

  // Mutation para enviar nova foto
  const submitPhotoMutation = useMutation({
    mutationFn: async (photoData: InsertFanPhoto) => {
      return apiRequest("/api/fan-gallery", "POST", photoData);
    },
    onSuccess: () => {
      toast({
        title: "Foto enviada com sucesso!",
        description: "Sua foto está aguardando aprovação. Em breve aparecerá na galeria!",
      });
      setFormData({ name: "", caption: "", imageUrl: "" });
      setImagePreview("");
      queryClient.invalidateQueries({ queryKey: ["/api/fan-gallery"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/my-photos"] });
    },
    onError: (error) => {
      console.error("Erro detalhado ao enviar foto:", error);
      if (isUnauthorizedError(error)) {
        toast({
          title: "Sessão expirada",
          description: "Você será redirecionado para fazer login novamente.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
        return;
      }
      
      // Handle specific Vercel timeout and size errors
      const errorMessage = error.message || "";
      if (errorMessage.includes("Timeout") || errorMessage.includes("408")) {
        toast({
          title: "Timeout do Vercel",
          description: "Imagem muito grande ou conexão lenta. Tente com uma imagem menor.",
          variant: "destructive",
        });
      } else if (errorMessage.includes("413") || errorMessage.includes("muito grande")) {
        toast({
          title: "Imagem muito grande",
          description: "Comprima mais a imagem antes de enviar.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao enviar foto",
          description: errorMessage || "Tente novamente mais tarde.",
          variant: "destructive",
        });
      }
    },
  });

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Definir tamanho máximo muito menor para Vercel
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 300;
        
        let { width, height } = img;
        
        // Redimensionar se necessário
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = (height * MAX_WIDTH) / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = (width * MAX_HEIGHT) / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Desenhar e comprimir
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Usar qualidade muito baixa para Vercel (máximo 100KB)
        let quality = 0.3;
        let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Se ainda muito grande, reduzir qualidade drasticamente
        while (compressedDataUrl.length > 100000 && quality > 0.1) {
          quality -= 0.05;
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        
        resolve(compressedDataUrl);
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verificar tamanho (máximo 2MB para Vercel)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "A imagem deve ter no máximo 2MB para funcionar no Vercel.",
          variant: "destructive",
        });
        return;
      }

      // Verificar tipo
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Formato inválido",
          description: "Apenas imagens são permitidas.",
          variant: "destructive",
        });
        return;
      }

      setIsProcessingImage(true);
      try {
        const compressedDataUrl = await compressImage(file);
        setFormData(prev => ({ ...prev, imageUrl: compressedDataUrl }));
        setImagePreview(compressedDataUrl);
        
        // Check final compressed size
        const finalSizeKB = Math.round(compressedDataUrl.length * 0.75 / 1024); // Approximate KB size
        toast({
          title: "Imagem carregada",
          description: `Imagem comprimida para ~${finalSizeKB}KB e pronta para envio.`,
        });
      } catch (error) {
        toast({
          title: "Erro ao processar imagem",
          description: "Tente novamente com outra imagem.",
          variant: "destructive",
        });
      } finally {
        setIsProcessingImage(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Dados do formulário:", {
      name: formData.name,
      caption: formData.caption,
      imageUrlLength: formData.imageUrl.length,
      hasImageUrl: !!formData.imageUrl
    });
    
    if (!formData.name.trim() || !formData.caption.trim() || !formData.imageUrl) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos e selecione uma imagem.",
        variant: "destructive",
      });
      return;
    }

    console.log("Enviando foto para API...");
    submitPhotoMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-between items-center mb-6">
            <Button
              variant="outline"
              onClick={() => window.location.href = "/"}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Site
            </Button>
            <div className="flex-1" />
          </div>
          <h1 className="text-4xl font-bold text-amber-800 dark:text-amber-200 mb-4">
            Galeria dos Fãs da CUCA
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Compartilhe seus momentos especiais com a CUCA! Envie sua foto e faça parte da nossa galeria.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulário de envio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Envie sua foto
              </CardTitle>
              <CardDescription>
                Compartilhe seu momento CUCA conosco
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Seu nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Digite seu nome"
                    maxLength={255}
                  />
                </div>

                <div>
                  <Label htmlFor="caption">Legenda da foto</Label>
                  <Textarea
                    id="caption"
                    value={formData.caption}
                    onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                    placeholder="Conte-nos sobre este momento especial..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="image">Escolha sua foto</Label>
                  <div className="mt-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('image')?.click()}
                      className="w-full h-32 border-dashed border-2 hover:border-amber-400"
                      disabled={isProcessingImage}
                    >
                      <div className="text-center">
                        {isProcessingImage ? (
                          <>
                            <div className="h-8 w-8 mx-auto mb-2 border-2 border-gray-400 border-t-amber-600 rounded-full animate-spin" />
                            <p>Processando imagem...</p>
                          </>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <p>Clique para escolher uma foto</p>
                            <p className="text-sm text-gray-500">Máximo 2MB (será comprimida para Vercel)</p>
                          </>
                        )}
                      </div>
                    </Button>
                  </div>
                </div>

                {imagePreview && (
                  <div className="mt-4">
                    <Label>Pré-visualização</Label>
                    <div className="mt-2 border rounded-lg overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-700"
                  disabled={submitPhotoMutation.isPending}
                >
                  {submitPhotoMutation.isPending ? "Enviando..." : "Enviar foto"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Minhas fotos enviadas */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Minhas fotos
                </CardTitle>
                <CardDescription>
                  Estado das suas fotos enviadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {myPhotos.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {myPhotos.map((photo) => (
                      <div key={photo.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <img
                          src={getImageSrc(photo)}
                          alt={photo.caption || "Fan photo"}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{photo.caption || "Sem legenda"}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(photo.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {photo.status === 'pending' && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Pendente
                            </Badge>
                          )}
                          {photo.status === 'approved' && (
                            <Badge variant="default" className="flex items-center gap-1 bg-green-600">
                              <CheckCircle className="h-3 w-3" />
                              Aprovada
                            </Badge>
                          )}
                          {photo.status === 'rejected' && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <XCircle className="h-3 w-3" />
                              Rejeitada
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Você ainda não enviou fotos.</p>
                    <p className="text-sm text-gray-400">Envie sua primeira foto!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Galeria de fotos aprovadas */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Fotos dos nossos fãs
                </CardTitle>
                <CardDescription>
                  Momentos especiais compartilhados pelos fãs da CUCA
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="grid grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : approvedPhotos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {approvedPhotos.map((photo) => (
                      <div key={photo.id} className="group relative">
                        <img
                          src={getImageSrc(photo)}
                          alt={photo.caption || "Fan photo"}
                          className="w-full aspect-square object-cover rounded-lg transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-end">
                          <div className="p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="font-semibold text-sm">{photo.name}</p>
                            <p className="text-xs">{photo.caption || "Sem legenda"}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Ainda não há fotos na galeria.</p>
                    <p className="text-sm text-gray-400">Seja o primeiro a compartilhar!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}