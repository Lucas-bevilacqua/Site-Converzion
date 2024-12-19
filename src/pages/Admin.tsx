import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const formSchema = z.object({
  nomeempresa: z.string().min(2, {
    message: "Nome da empresa deve ter pelo menos 2 caracteres.",
  }),
  telefoneempresa: z.string().min(10, {
    message: "Telefone deve ter pelo menos 10 caracteres.",
  }).max(15, {
    message: "Telefone deve ter no máximo 15 caracteres.",
  }),
  emailempresa: z.string().email({
    message: "Email inválido.",
  }),
  apidify: z.string().optional(),
  urlinstance: z.string().optional(),
  apikeyevo: z.string().optional(),
  prompt: z.string().optional(),
});

export default function Admin() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [empresas, setEmpresas] = useState([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomeempresa: "",
      telefoneempresa: "",
      emailempresa: "",
      apidify: "",
      urlinstance: "",
      apikeyevo: "",
      prompt: "",
    },
  });

  useEffect(() => {
    fetchEmpresas();
  }, []);

  async function fetchEmpresas() {
    try {
      const { data, error } = await supabase
        .from("empresas")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error("Error fetching empresas:", error);
        return;
      }

      setEmpresas(data || []);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      const { error } = await supabase.from("empresas").insert([
        {
          nomeempresa: values.nomeempresa,
          telefoneempresa: values.telefoneempresa,
          emailempresa: values.emailempresa,
          "API Dify": values.apidify,
          url_instance: values.urlinstance,
          apikeyevo: values.apikeyevo,
          prompt: values.prompt,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Empresa cadastrada com sucesso!",
        description: "A empresa foi adicionada ao banco de dados.",
      });

      form.reset();
      fetchEmpresas();
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar empresa",
        description: "Ocorreu um erro ao tentar cadastrar a empresa.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Cadastro de Empresa</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                name="emailempresa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email da Empresa</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="empresa@exemplo.com" {...field} />
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
                    <FormLabel>Telefone da Empresa</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Ex: 11999999999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apidify"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Dify</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="urlinstance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Instance</FormLabel>
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

              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prompt</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={loading}>
                {loading ? "Cadastrando..." : "Cadastrar Empresa"}
              </Button>
            </form>
          </Form>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Empresas Cadastradas</h2>
          <div className="space-y-4">
            {empresas.map((empresa: any) => (
              <div
                key={empresa.id}
                className="p-4 border rounded-lg shadow-sm space-y-2"
              >
                <p>
                  <strong>Nome:</strong> {empresa.nomeempresa}
                </p>
                <p>
                  <strong>Email:</strong> {empresa.emailempresa}
                </p>
                <p>
                  <strong>Telefone:</strong> {empresa.telefoneempresa}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}