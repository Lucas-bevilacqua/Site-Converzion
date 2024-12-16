import { Mail, Phone, MessageSquare } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-muted py-12 px-4">
      <div className="container max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Sobre Nós</h3>
            <p className="text-muted-foreground">
              No Converzion, ajudamos empresas a crescer com soluções de 
              inteligência artificial personalizadas.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Contato</h3>
            <div className="space-y-2">
              <a href="mailto:contato@converzion.com" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-4 h-4" />
                contato@converzion.com
              </a>
              <a href="tel:+5511999999999" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Phone className="w-4 h-4" />
                (11) 99999-9999
              </a>
              <a href="https://wa.me/5511999999999" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <MessageSquare className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Links Rápidos</h3>
            <div className="space-y-2">
              <a href="#beneficios" className="block text-muted-foreground hover:text-primary transition-colors">
                Benefícios
              </a>
              <a href="#processo" className="block text-muted-foreground hover:text-primary transition-colors">
                Processo
              </a>
              <a href="#casos" className="block text-muted-foreground hover:text-primary transition-colors">
                Casos de Sucesso
              </a>
              <a href="#agendar" className="block text-muted-foreground hover:text-primary transition-colors">
                Agendar Reunião
              </a>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Newsletter</h3>
            <p className="text-muted-foreground">
              Receba novidades e atualizações sobre automação de vendas.
            </p>
            <form className="space-y-2">
              <input
                type="email"
                placeholder="Seu e-mail"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="w-full px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors">
                Inscrever-se
              </button>
            </form>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-muted-foreground">
          <p>© 2024 Converzion. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};