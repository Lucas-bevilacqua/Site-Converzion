import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const EvolutionSettingsForm = () => {
  const [evolutionUrl, setEvolutionUrl] = useState("");
  const [evolutionApiKey, setEvolutionApiKey] = useState("");
  const [evolutionInstance, setEvolutionInstance] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadEvolutionSettings();
  }, []);

  const loadEvolutionSettings = async () => {
    try {
      console.log('🔄 Carregando configurações do Evolution...');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        console.log('❌ Usuário não autenticado');
        return;
      }

      const { data: empresa, error } = await supabase
        .from('Empresas')
        .select('url_instance, apikeyevo, instance_name')
        .eq('emailempresa', session.user.email)
        .maybeSingle();

      if (error) {
        console.error('❌ Erro ao carregar configurações:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as configurações",
          variant: "destructive",
        });
        return;
      }

      if (empresa) {
        console.log('✅ Configurações carregadas com sucesso');
        setEvolutionUrl(empresa.url_instance || '');
        setEvolutionApiKey(empresa.apikeyevo || '');
        setEvolutionInstance(empresa.instance_name || '');
      } else {
        console.log('ℹ️ Nenhuma configuração encontrada para este usuário');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações",
        variant: "destructive",
      });
    }
  };

  const handleEvolutionSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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

      // Store the instance name as is, without any modifications
      const { error } = await supabase
        .from('Empresas')
        .update({
          url_instance: evolutionUrl,
          apikeyevo: evolutionApiKey,
          instance_name: evolutionInstance.trim(),
          is_connected: false
        })
        .eq('emailempresa', session.user.email);

      if (error) {
        console.error('❌ Erro ao salvar configurações:', error);
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
      console.error('❌ Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
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
          <p className="text-sm text-gray-500 mt-1">
            O nome da instância será usado exatamente como digitado.
          </p>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
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
  );
};