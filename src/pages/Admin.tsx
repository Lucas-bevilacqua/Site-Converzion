import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  nomeempresa: z.string().min(2, "Nome muito curto"),
  telefoneempresa: z.string().min(10, "Telefone inválido").max(15, "Telefone inválido"),
  url_instance: z.string().url("URL inválida"),
  apikeyevo: z.string().min(10, "API Key muito curta"),
});

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || session.user.email !== 'lucasobevi@gmail.com') {
      navigate('/');
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta página",
        variant: "destructive",
      });
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomeempresa: "",
      telefoneempresa: "",
      url_instance: "",
      apikeyevo: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      console.log("Iniciando cadastro da empresa:", values);
      
      // Criar empresa no Supabase
      const { data: empresa, error: empresaError } = await supabase
        .from('empresas')
        .insert([{
          nomeempresa: values.nomeempresa,
          telefoneempresa: values.telefoneempresa,
          url_instance: values.url_instance,
          apikeyevo: values.apikeyevo,
          is_connected: false,
        }])
        .select()
        .single();

      if (empresaError) {
        console.error('Erro ao cadastrar empresa:', empresaError);
        throw new Error(`Erro ao cadastrar empresa: ${empresaError.message}`);
      }

      console.log("Empresa cadastrada com sucesso:", empresa);

      // Criar usuário no Supabase Auth
      const { error: authError } = await supabase.auth.signUp({
        email: values.telefoneempresa,
        password: "senha123",
      });

      if (authError) {
        console.error('Erro ao criar usuário:', authError);
        throw new Error(`Erro ao criar usuário: ${authError.message}`);
      }

      toast({
        title: "Sucesso!",
        description: "Empresa cadastrada com sucesso",
      });

      form.reset();
    } catch (error) {
      console.error('Erro detalhado:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível cadastrar a empresa",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Cadastro de Empresas</h1>
          <Button variant="outline" onClick={() => navigate('/')}>
            Voltar
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="nomeempresa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Empresa</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="telefoneempresa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email da Empresa</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url_instance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Instância Evolution API</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apikeyevo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key Evolution</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cadastrar Empresa
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Admin;