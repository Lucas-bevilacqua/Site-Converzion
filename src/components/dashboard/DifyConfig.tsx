import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

interface DifyConfigProps {
  apiKey: string;
  endpoint: string;
  loading: boolean;
  onApiKeyChange: (value: string) => void;
  onEndpointChange: (value: string) => void;
  onSaveConfig: () => void;
  empresaId?: number;
}

const DifyConfig = ({ 
  apiKey, 
  endpoint, 
  loading, 
  onApiKeyChange, 
  onEndpointChange, 
  onSaveConfig,
  empresaId 
}: DifyConfigProps) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleSaveConfig = async () => {
    if (!empresaId) {
      toast({
        title: "Erro",
        description: "ID da empresa não encontrado",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      console.log('Atualizando configurações do Dify para empresa:', empresaId);
      const { error } = await supabase
        .from('Empresas')
        .update({
          'API Dify': apiKey,
          dify_endpoint: endpoint
        })
        .eq('id', empresaId);

      if (error) throw error;

      console.log('Configurações do Dify atualizadas com sucesso');
      toast({
        title: "Sucesso",
        description: "Configurações do Dify atualizadas com sucesso!",
      });

      onSaveConfig();
    } catch (error) {
      console.error('Error updating Dify config:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as configurações",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Configuração do Dify</h2>
      <p className="text-muted-foreground">
        Configure as credenciais do Dify para esta empresa.
      </p>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="apiKey" className="text-sm font-medium text-foreground">
            API Key
          </label>
          <Input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder="Digite a API Key do Dify..."
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="endpoint" className="text-sm font-medium text-foreground">
            API Endpoint
          </label>
          <Input
            id="endpoint"
            value={endpoint}
            onChange={(e) => onEndpointChange(e.target.value)}
            placeholder="Digite o endpoint da API do Dify..."
          />
        </div>
      </div>

      <Button 
        onClick={handleSaveConfig} 
        disabled={loading || saving}
        className="w-full sm:w-auto"
      >
        {(loading || saving) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Salvar Configurações
      </Button>
    </Card>
  );
};

export default DifyConfig;