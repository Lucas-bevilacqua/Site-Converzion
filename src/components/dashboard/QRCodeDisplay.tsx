import { Loader2 } from "lucide-react";

interface QRCodeDisplayProps {
  qrCodeUrl: string | null;
  isGeneratingQR: boolean;
}

export const QRCodeDisplay = ({ qrCodeUrl, isGeneratingQR }: QRCodeDisplayProps) => {
  if (!qrCodeUrl && isGeneratingQR) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!qrCodeUrl) return null;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400">
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
  );
};