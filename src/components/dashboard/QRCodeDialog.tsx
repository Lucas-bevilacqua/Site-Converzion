import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface QRCodeDialogProps {
  showQRCode: boolean;
  setShowQRCode: (show: boolean) => void;
  qrCode: string | null;
  needsSetup: boolean;
}

export const QRCodeDialog = ({ showQRCode, setShowQRCode, qrCode, needsSetup }: QRCodeDialogProps) => {
  return (
    <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {needsSetup ? 'Configurar WhatsApp' : 'Conectar WhatsApp'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center p-6">
          {qrCode && (
            <img
              src={qrCode}
              alt="QR Code para conexão do WhatsApp"
              className="w-64 h-64"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};