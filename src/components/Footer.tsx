import { Mail, Phone, MessageSquare, CircuitBoard, Database, Bot } from "lucide-react";
import { motion } from "framer-motion";

export const Footer = () => {
  return (
    <footer className="bg-muted py-12 px-4 relative">
      <div className="absolute inset-0 bg-tech-pattern opacity-30"></div>

      {/* Animated tech elements */}
      <motion.div 
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          rotate: { duration: 25, repeat: Infinity, ease: "linear" },
          scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
        className="absolute top-20 left-10 text-primary/5"
      >
        <CircuitBoard size={80} />
      </motion.div>
      
      <motion.div 
        animate={{ 
          rotate: -360,
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          rotate: { duration: 30, repeat: Infinity, ease: "linear" },
          scale: { duration: 5, repeat: Infinity, ease: "easeInOut" }
        }}
        className="absolute bottom-20 right-10 text-accent/5"
      >
        <Database size={100} />
      </motion.div>

      <motion.div 
        animate={{ 
          y: [-10, 10, -10],
          rotate: 180
        }}
        transition={{ 
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 20, repeat: Infinity, ease: "linear" }
        }}
        className="absolute top-1/3 right-1/4 text-primary/5"
      >
        <Bot size={60} />
      </motion.div>
      
      <div className="container max-w-6xl relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h3 className="font-bold text-lg text-foreground">Sobre Nós</h3>
            <p className="text-gray-300">
              No Converzion, ajudamos empresas a crescer com soluções de 
              inteligência artificial personalizadas.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="font-bold text-lg text-foreground">Contato</h3>
            <div className="space-y-2">
              <motion.a 
                whileHover={{ scale: 1.05 }}
                href="mailto:contato@converzion.com" 
                className="flex items-center gap-2 text-gray-300 hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                contato@conv

erzion.com
              </motion.a>
              <motion.a 
                whileHover={{ scale: 1.05 }}
                href="tel:+5511999999999" 
                className="flex items-center gap-2 text-gray-300 hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4" />
                (11) 99999-9999
              </motion.a>
              <motion.a 
                whileHover={{ scale: 1.05 }}
                href="https://wa.me/5511999999999" 
                className="flex items-center gap-2 text-gray-300 hover:text-primary transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                WhatsApp
              </motion.a>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="font-bold text-lg text-foreground">Links Rápidos</h3>
            <div className="space-y-2">
              {["Benefícios", "Processo", "Casos de Sucesso", "Agendar Reunião"].map((link, index) => (
                <motion.a
                  key={link}
                  whileHover={{ scale: 1.05 }}
                  href={`#${link.toLowerCase().replace(/ /g, "-")}`}
                  className="block text-gray-300 hover:text-primary transition-colors"
                >
                  {link}
                </motion.a>
              ))}
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
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
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors shadow-lg shadow-primary/20"
              >
                Inscrever-se
              </motion.button>
            </form>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 pt-8 border-t border-primary/10 text-center text-gray-300"
        >
          <p>© 2024 Converzion. Todos os direitos reservados.</p>
        </motion.div>
      </div>
    </footer>
  );
};