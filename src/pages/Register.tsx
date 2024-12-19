import { LoginForm } from "@/components/auth/LoginForm";

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Cadastro</h2>
          <p className="text-muted-foreground mt-2">
            Crie sua conta para começar
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
};

export default Register;