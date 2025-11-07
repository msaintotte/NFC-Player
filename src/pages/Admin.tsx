import { useState } from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAudioConfigs } from '@/hooks/useAudioConfigs';
import { Upload, Trash2, Music, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { AudioConfig } from '@/config/audioConfigs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function Admin() {
  const { configs, isLoading, uploadAudio, createConfig, deleteConfig } = useAudioConfigs();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    artist: '',
    description: '',
    albumArt: '',
    duration: '',
    type: 'local' as AudioConfig['type'],
    spotifyUrl: '',
    youtubeUrl: '',
    newsletterUrl: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!formData.title) {
        setFormData(prev => ({ ...prev, title: file.name.replace(/\.[^/.]+$/, '') }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadProgress(0);

    try {
      let audioUrl = formData.type === 'local' && selectedFile ? '' : undefined;

      if (formData.type === 'local' && selectedFile) {
        setUploadProgress(30);
        const url = await uploadAudio.mutateAsync(selectedFile);
        audioUrl = url;
        setUploadProgress(60);
      }

      const config: Omit<AudioConfig, 'created_at' | 'updated_at'> = {
        id: formData.id || `audio-${Date.now()}`,
        title: formData.title,
        artist: formData.artist || undefined,
        description: formData.description || undefined,
        albumArt: formData.albumArt || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d',
        duration: formData.duration || undefined,
        type: formData.type,
        audioUrl: audioUrl,
        spotifyUrl: formData.type === 'spotify' ? formData.spotifyUrl : undefined,
        youtubeUrl: formData.type === 'youtube' ? formData.youtubeUrl : undefined,
        newsletterUrl: formData.type === 'newsletter' ? formData.newsletterUrl : undefined,
      };

      setUploadProgress(80);
      await createConfig.mutateAsync(config);
      setUploadProgress(100);

      // Reset form
      setFormData({
        id: '',
        title: '',
        artist: '',
        description: '',
        albumArt: '',
        duration: '',
        type: 'local',
        spotifyUrl: '',
        youtubeUrl: '',
        newsletterUrl: '',
      });
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading audio:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este audio?')) {
      await deleteConfig.mutateAsync(id);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Music className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Gestión de Audios</h1>
            <p className="text-muted-foreground">Sube y administra tus archivos de audio</p>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Subir Nuevo Audio</CardTitle>
            <CardDescription>
              Completa el formulario para agregar un nuevo audio a tu colección
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="id">ID único (opcional)</Label>
                  <Input
                    id="id"
                    value={formData.id}
                    onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                    placeholder="audio-123 (se generará automáticamente)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: AudioConfig['type']) => 
                      setFormData(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local</SelectItem>
                      <SelectItem value="spotify">Spotify</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.type === 'local' && (
                <div className="space-y-2">
                  <Label htmlFor="file">Archivo de Audio</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="file"
                      type="file"
                      accept="audio/*"
                      onChange={handleFileChange}
                      className="flex-1"
                    />
                    {selectedFile && (
                      <span className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    )}
                  </div>
                </div>
              )}

              {formData.type === 'spotify' && (
                <div className="space-y-2">
                  <Label htmlFor="spotifyUrl">URL de Spotify</Label>
                  <Input
                    id="spotifyUrl"
                    value={formData.spotifyUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, spotifyUrl: e.target.value }))}
                    placeholder="https://open.spotify.com/..."
                  />
                </div>
              )}

              {formData.type === 'youtube' && (
                <div className="space-y-2">
                  <Label htmlFor="youtubeUrl">URL de YouTube</Label>
                  <Input
                    id="youtubeUrl"
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
              )}

              {formData.type === 'newsletter' && (
                <div className="space-y-2">
                  <Label htmlFor="newsletterUrl">URL del Newsletter</Label>
                  <Input
                    id="newsletterUrl"
                    value={formData.newsletterUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, newsletterUrl: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Mi canción favorita"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="artist">Artista</Label>
                  <Input
                    id="artist"
                    value={formData.artist}
                    onChange={(e) => setFormData(prev => ({ ...prev, artist: e.target.value }))}
                    placeholder="Nombre del artista"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Breve descripción del contenido"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="albumArt">URL de Imagen</Label>
                  <Input
                    id="albumArt"
                    value={formData.albumArt}
                    onChange={(e) => setFormData(prev => ({ ...prev, albumArt: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duración</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="3:45"
                  />
                </div>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground text-center">
                    Subiendo... {uploadProgress}%
                  </p>
                </div>
              )}

              <Button type="submit" disabled={isUploading || !formData.title} className="w-full">
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Subir Audio
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audios Existentes ({configs.length})</CardTitle>
            <CardDescription>
              Gestiona tus audios configurados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : configs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay audios configurados aún
              </p>
            ) : (
              <div className="space-y-4">
                {configs.map((config) => (
                  <div
                    key={config.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <img
                      src={config.albumArt || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d'}
                      alt={config.title}
                      className="w-16 h-16 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{config.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">{config.artist}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                          {config.type}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ID: {config.id}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(config.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
