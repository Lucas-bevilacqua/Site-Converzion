import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AIAgentConfig } from "@/components/dashboard/AIAgentConfig";
import { WhatsAppStatus } from "@/components/dashboard/WhatsAppStatus";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No session found, redirecting to login');
        navigate('/login');
        return;
      }

      console.log('Loading empresa data for:', session.user.email);
      const { data: empresa, error } = await supabase
        .from('Empresas')
        .select('id, prompt, is_admin')
        .eq('emailempresa', session.user.email)
        .single();

      if (error) {
        console.error('Error loading empresa:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados da empresa.",
          variant: "destructive",
        });
        return;
      }

      if (empresa) {
        console.log('Empresa data loaded:', { 
          id: empresa.id, 
          hasPrompt: !!empresa.prompt,
          isAdmin: empresa.is_admin
        });
        setEmpresaId(empresa.id);
        setPrompt(empresa.prompt || "");
        setIsAdmin(empresa.is_admin || false);
      }
    };

    checkAuth();
  }, [navigate, toast]);

  const handleSavePrompt = async () => {
    if (!empresaId) return;

    setLoading(true);
    console.log('Saving prompt for empresa:', empresaId);

    const { error } = await supabase
      .from('Empresas')
      .update({ prompt })
      .eq('id', empresaId);

    if (error) {
      console.error('Error saving prompt:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } else {
      console.log('Prompt saved successfully');
      toast({
        title: "Sucesso",
        description: "Alterações salvas com sucesso.",
      });
    }

    setLoading(false);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            <WhatsAppStatus />

            <AIAgentConfig
              prompt={prompt}
              loading={loading}
              onPromptChange={setPrompt}
              onSavePrompt={handleSavePrompt}
              empresaId={empresaId}
              isAdmin={isAdmin}
            />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}