import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestGaleria() {
  const [result, setResult] = useState<string>('');

  const testDirectAPI = async () => {
    try {
      console.log('Testing direct API call...');
      const response = await fetch('/api/fan-gallery', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      const contentType = response.headers.get('content-type');
      console.log('Response content-type:', contentType);
      console.log('Response status:', response.status);
      
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        setResult(`SUCCESS - JSON Response: ${JSON.stringify(data, null, 2)}`);
      } else {
        const text = await response.text();
        setResult(`ERROR - HTML Response (first 500 chars): ${text.substring(0, 500)}`);
      }
    } catch (error) {
      setResult(`ERROR: ${error}`);
    }
  };

  const testGalleryService = async () => {
    try {
      console.log('Testing gallery service...');
      // Import dynamically to see the logs
      const { galleryService } = await import('@/lib/galleryService');
      const photos = await galleryService.getApprovedPhotos();
      setResult(`SUCCESS - Gallery Service: ${JSON.stringify(photos, null, 2)}`);
    } catch (error) {
      setResult(`ERROR: ${error}`);
    }
  };

  const testSupabaseConfig = () => {
    const config = {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'NOT SET',
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
      NODE_ENV: import.meta.env.NODE_ENV,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD,
      hostname: window.location.hostname
    };
    setResult(`Environment Config: ${JSON.stringify(config, null, 2)}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Teste de Diagnóstico da Galeria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <Button onClick={testDirectAPI}>
              Testar API Direta
            </Button>
            <Button onClick={testGalleryService}>
              Testar Gallery Service
            </Button>
            <Button onClick={testSupabaseConfig}>
              Ver Configuração
            </Button>
          </div>
          
          {result && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Resultado:</h3>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-auto max-h-96">
                {result}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}