import { WhatsAppStatus } from "@/components/dashboard/WhatsAppStatus";
import { AIAgentConfig } from "@/components/dashboard/AIAgentConfig";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export default function Chat() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [empresaId, setEmpresaId] = useState<number>();
  const [difyApiKey, setDifyApiKey] = useState("");
  const [difyEndpoint, setDifyEndpoint] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEmpresaData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.email) return;

        const { data: empresa, error } = await supabase
          .from('Empresas')
          .select('*')
          .eq('emailempresa', session.user.email)
          .maybeSingle();

        if (error) throw error;

        if (empresa) {
          setEmpresaId(empresa.id);
          setPrompt(empresa.prompt || "");
          setDifyApiKey(empresa["API Dify"] || "");
          setDifyEndpoint(empresa.dify_endpoint || "");
          setIsAdmin(empresa.is_admin || false);
        }
      } catch (error) {
        console.error('Error fetching empresa data:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados da empresa",
          variant: "destructive",
        });
      }
    };

    fetchEmpresaData();
  }, [toast]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <WhatsAppStatus />
      <AIAgentConfig
        prompt={prompt}
        loading={loading}
        onPromptChange={setPrompt}
        onSavePrompt={() => {}}
        empresaId={empresaId}
        difyApiKey={difyApiKey}
        difyEndpoint={difyEndpoint}
        isAdmin={isAdmin}
      />
    </div>
  );
}