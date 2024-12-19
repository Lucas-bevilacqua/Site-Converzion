import { supabase } from "@/integrations/supabase/client";

const checkUserPassword = async () => {
  const { data, error } = await supabase
    .from('Empresas')
    .select('senha')
    .eq('emailempresa', 'lucas.bevilacqua@idealtrends.com.br')
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return;
  }

  console.log('User password:', data?.senha);
  return data?.senha;
};

// Execute the check
checkUserPassword();