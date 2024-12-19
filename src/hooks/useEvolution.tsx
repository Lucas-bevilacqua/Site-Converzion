import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useEvolution = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Iniciando processo de conexão...');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        console.log('❌ Usuário não autenticado');
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Usuário não autenticado"
        });
        return;
      }

      const { data: empresa, error: empresaError } = await supabase
        .from('Empresas')
        .select('url_instance, instance_name, apikeyevo')
        .eq('emailempresa', session.user.email)
        .maybeSingle();

      if (empresaError || !empresa?.url_instance || !empresa?.apikeyevo || !empresa?.instance_name) {
        console.error('Erro ao buscar dados da empresa:', empresaError);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Credenciais da Evolution não configuradas. Configure as credenciais nas configurações."
        });
        navigate('/dashboard/settings');
        return;
      }

      console.log('📱 Instance name:', empresa.instance_name);
      console.log('🔗 URL da instância:', empresa.url_instance);

      const { data: qrData, error } = await supabase.functions.invoke('evolution-qr', {
        body: { email: session.user.email }
      });

      if (error) {
        console.error('❌ Erro ao gerar QR code:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: error.message || "Não foi possível gerar o QR code. Tente novamente."
        });
        return;
      }

      console.log('✅ QR code gerado com sucesso');
      setQrCode(qrData.qr);
      return qrData.qr;

    } catch (error) {
      console.error('❌ Erro ao conectar:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao tentar conectar. Tente novamente."
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    qrCode,
    handleConnect
  };
};