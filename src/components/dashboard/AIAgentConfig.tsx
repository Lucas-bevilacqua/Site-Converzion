import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface AIAgentConfigProps {
  prompt: string;
  loading: boolean;
  onPromptChange: (value: string) => void;
  onSavePrompt: () => void;
}

const AIAgentConfig = ({ prompt, loading, onPromptChange, onSavePrompt }: AIAgentConfigProps) => {
  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Configuração do Agente IA</h2>
      <p className="text-muted-foreground">
        Configure o prompt que seu agente IA utilizará para interagir com seus clientes.
      </p>
      
      <div className="space-y-2">
        <label htmlFor="prompt" className="text-sm font-medium text-foreground">
          Prompt do Agente
        </label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Digite aqui o prompt para seu agente IA..."
          className="min-h-[200px]"
        />
      </div>

      <Button 
        onClick={onSavePrompt} 
        disabled={loading}
        className="w-full sm:w-auto"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Salvar Prompt
      </Button>
    </Card>
  );
};

export default AIAgentConfig;