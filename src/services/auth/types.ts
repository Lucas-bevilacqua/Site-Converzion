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