interface ConnectionIndicatorProps {
  isConnected: boolean;
  needsSetup: boolean;
}

export const ConnectionIndicator = ({ isConnected, needsSetup }: ConnectionIndicatorProps) => {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
      <span>{isConnected ? 'Conectado' : needsSetup ? 'Não configurado' : 'Desconectado'}</span>
    </div>
  );
};