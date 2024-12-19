import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface WhatsAppStatusProps {
  isConnected: boolean;
  isGeneratingQR: boolean;
  qrCodeUrl: string | null;
  onGenerateQR: () => void;
}

const WhatsAppStatus = ({ isConnected, isGeneratingQR, qrCodeUrl, onGenerateQR }: WhatsAppStatusProps) => {
  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Status do WhatsApp</h2>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
        {!isConnected && (
          <Button 
            onClick={onGenerateQR} 
            disabled={isGeneratingQR}
            size="sm"
          >
            {isGeneratingQR && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Gerar QR Code
          </Button>
        )}
      </div>
      
      {!isConnected && qrCodeUrl && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Escaneie o QR Code abaixo com seu WhatsApp para conectar:
          </p>
          <div className="flex justify-center">
            <img 
              src={qrCodeUrl} 
              alt="QR Code WhatsApp" 
              className="max-w-[300px] h-auto"
            />
          </div>
        </div>
      )}
    </Card>
  );
};

export default WhatsAppStatus;