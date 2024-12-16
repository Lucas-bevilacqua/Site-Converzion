import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface LeadFormData {
  name: string;
  email: string;
  phone: string;
}

export const LeadCaptureForm = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormData>();

  const onSubmit = async (data: LeadFormData) => {
    try {
      setIsSubmitting(true);
      console.log("Submitting lead data:", data);

      // Format phone number for WhatsApp
      const phoneNumber = data.phone.replace(/\D/g, "");
      
      // Create HubSpot contact
      const hubspotData = {
        properties: {
          firstname: data.name,
          email: data.email,
          phone: data.phone,
          lifecyclestage: "lead",
          lead_source: "Website Form",
        },
      };

      // Send to HubSpot
      const response = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
        },
        body: JSON.stringify(hubspotData),
      });

      if (!response.ok) {
        throw new Error("Failed to create contact in HubSpot");
      }

      // Close form and show success message
      toast({
        title: "Sucesso!",
        description: "Você será redirecionado para o WhatsApp em instantes.",
      });

      // Redirect to WhatsApp
      const whatsappMessage = encodeURIComponent(
        `Olá! Me chamo ${data.name} e gostaria de saber mais sobre o Converzion.`
      );
      const whatsappUrl = `https://wa.me/5511999999999?text=${whatsappMessage}`;
      
      // Close dialog and redirect
      onOpenChange(false);
      window.location.href = whatsappUrl;

    } catch (error) {
      console.error("Error submitting lead:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao enviar seus dados. Por favor, tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Vamos conversar?
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              {...register("name", { required: "Nome é obrigatório" })}
              placeholder="Seu nome"
              className="w-full"
            />
            {errors.name && (
              <span className="text-sm text-destructive">{errors.name.message}</span>
            )}
          </div>
          <div>
            <Input
              {...register("email", {
                required: "Email é obrigatório",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Email inválido",
                },
              })}
              type="email"
              placeholder="Seu email"
              className="w-full"
            />
            {errors.email && (
              <span className="text-sm text-destructive">{errors.email.message}</span>
            )}
          </div>
          <div>
            <Input
              {...register("phone", {
                required: "Telefone é obrigatório",
                pattern: {
                  value: /^\(?[1-9]{2}\)? ?(?:[2-8]|9[1-9])[0-9]{3}\-?[0-9]{4}$/,
                  message: "Telefone inválido",
                },
              })}
              placeholder="Seu telefone"
              className="w-full"
            />
            {errors.phone && (
              <span className="text-sm text-destructive">{errors.phone.message}</span>
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Falar com Especialista"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};