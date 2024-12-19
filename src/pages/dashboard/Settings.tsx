import { PasswordChangeForm } from "@/components/settings/PasswordChangeForm";
import { EvolutionSettingsForm } from "@/components/settings/EvolutionSettingsForm";

export default function Settings() {
  console.log('🔧 Rendering Settings page');
  
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>
      <EvolutionSettingsForm />
      <PasswordChangeForm />
    </div>
  );
}