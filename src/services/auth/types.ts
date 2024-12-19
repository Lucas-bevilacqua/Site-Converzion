export interface AuthResponse {
  success: boolean;
  error?: string;
}

export interface EmpresaData {
  id: number;
  emailempresa: string;
  senha: string;
  NomeEmpresa: string;
}

export interface EvolutionCredentials {
  url_instance: string;
  instance_name: string;
  apikeyevo: string;
}