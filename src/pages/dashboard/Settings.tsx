import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function Settings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [evolutionUrl, setEvolutionUrl] = useState("");
  const [evolutionApiKey, setEvolutionApiKey] = useState("");
  const [evolutionInstance, setEvolutionInstance] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [loadingEvo, setLoadingEvo] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadEvolutionSettings();
  }, []);

  const loadEvolutionSettings = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) return;

      const { data: empresa, error } = await supabase
        .from('Empresas')
        .select('url_instance, apikeyevo, instance_name')
        .eq('emailempresa', session.user.email)
        .single();

      if (error) {
        console.error('Erro ao carregar configurações:', error);
        return;
      }

      if (empresa) {
        setEvolutionUrl(empresa.url_instance || '');
        setEvolutionApiKey(empresa.apikeyevo || '');
        setEvolutionInstance(empresa.instance_name || '');
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a senha",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Senha atualizada com sucesso",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setLoading(false);
  };

  const handleEvolutionSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingEvo(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('Empresas')
        .update({
          url_instance: evolutionUrl,
          apikeyevo: evolutionApiKey,
          instance_name: evolutionInstance,
          is_connected: false // Reset connection status when updating credentials
        })
        .eq('emailempresa', session.user.email);

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível salvar as configurações",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Configurações do Evolution salvas com sucesso",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive",
      });
    } finally {
      setLoadingEvo(false);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>
      
      {/* Evolution Settings */}
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Configurações do Evolution</h2>
        <form onSubmit={handleEvolutionSettings} className="space-y-4">
          <div>
            <label htmlFor="evolutionUrl" className="block text-sm font-medium mb-1">
              URL da Instância
            </label>
            <Input
              id="evolutionUrl"
              type="text"
              placeholder="https://api.evolution.ai/instance/"
              value={evolutionUrl}
              onChange={(e) => setEvolutionUrl(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="evolutionApiKey" className="block text-sm font-medium mb-1">
              API Key
            </label>
            <Input
              id="evolutionApiKey"
              type="text"
              placeholder="Sua API Key do Evolution"
              value={evolutionApiKey}
              onChange={(e) => setEvolutionApiKey(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="evolutionInstance" className="block text-sm font-medium mb-1">
              Nome da Instância
            </label>
            <Input
              id="evolutionInstance"
              type="text"
              placeholder="Nome da sua instância"
              value={evolutionInstance}
              onChange={(e) => setEvolutionInstance(e.target.value)}
              required
            />
          </div>

          <Button type="submit" disabled={loadingEvo} className="w-full">
            {loadingEvo ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Configurações do Evolution'
            )}
          </Button>
        </form>
      </div>

      {/* Password Change Form */}
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Alterar Senha</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="relative">
            <Input
              type={showPasswords.current ? "text" : "password"}
              placeholder="Senha atual"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full pr-10"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showPasswords.current ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
            </button>
          </div>

          <div className="relative">
            <Input
              type={showPasswords.new ? "text" : "password"}
              placeholder="Nova senha"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full pr-10"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showPasswords.new ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
            </button>
          </div>

          <div className="relative">
            <Input
              type={showPasswords.confirm ? "text" : "password"}
              placeholder="Confirme a nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full pr-10"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showPasswords.confirm ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
            </button>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Atualizando..." : "Atualizar Senha"}
          </Button>
        </form>
      </div>
    </div>
  );
}