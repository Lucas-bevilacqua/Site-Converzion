import { Mail, Phone, MessageSquare } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-muted py-12 px-4 relative">
      <div className="absolute inset-0 bg-tech-pattern opacity-30"></div>
      <div className="container max-w-6xl relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-foreground">Sobre Nós</h3>
            <p className="text-gray-300">
              No Converzion, ajudamos empresas a crescer com soluções de 
              inteligência artificial personalizadas.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-foreground">Contato</h3>
            <div className="space-y-2">
              <a href="mailto:contato@converzion.com" className="flex items-center gap-2 text-gray-300 hover:text-primary transition-colors">
                <Mail className="w-4 h-4" />
                contato@converzion.com
              </a>
              <a href="tel:+5511999999999" className="flex items-center gap-2 text-gray-300 hover:text-primary transition-colors">
                <Phone className="w-4 h-4" />
                (11) 99999-9999
              </a>
              <a href="https://wa.me/5511999999999" className="flex items-center gap-2 text-gray-300 hover:text-primary transition-colors">
                <MessageSquare className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-foreground">Links Rápidos</h3>
            <div className="space-y-2">
              <a href="#beneficios" className="block text-gray-300 hover:text-primary transition-colors">
                Benefícios
              </a>
              <a href="#processo" className="block text-gray-300 hover:text-primary transition-colors">
                Processo
              </a>
              <a href="#casos" className="block text-gray-300 hover:text-primary transition-colors">
                Casos de Sucesso
              </a>
              <a href="#agendar" className="block text-gray-300 hover:text-primary transition-colors">
                Agendar Reunião
              </a>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-foreground">Newsletter</h3>
            <p className="text-gray-300">
              Receba novidades e atualizações sobre automação de vendas.
            </p>
            <form className="space-y-2">
              <input
                type="email"
                placeholder="Seu e-mail"
                className="w-full px-4 py-2 rounded-lg bg-background border border-primary/20 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              />
              <button className="w-full px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors shadow-lg shadow-primary/20">
                Inscrever-se
              </button>
            </form>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-primary/10 text-center text-gray-300">
          <p>© 2024 Converzion. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};