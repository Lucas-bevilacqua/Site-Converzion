import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CircuitBoard, Database, Bot } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="py-20 px-4 bg-tech-pattern relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-muted opacity-50"></div>

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
        className="absolute top-20 left-10 text-primary/10"
      >
        <CircuitBoard size={100} />
      </motion.div>
      
      <motion.div 
        animate={{ 
          rotate: -360,
          y: [-20, 20, -20]
        }}
        transition={{ 
          rotate: { duration: 30, repeat: Infinity, ease: "linear" },
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
        }}
        className="absolute bottom-20 right-10 text-accent/10"
      >
        <Database size={120} />
      </motion.div>

      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/3 right-1/4 text-primary/10"
      >
        <Bot size={80} />
      </motion.div>
      
      <div className="container max-w-6xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-6"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Pronto para Transformar Suas Conversas em Vendas Reais?
            <Sparkles className="w-6 h-6 text-primary" />
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Solicite uma reunião estratégica e descubra como o Converzion pode 
            revolucionar suas vendas pelo WhatsApp. Nossa equipe está pronta para 
            criar uma solução sob medida para o seu negócio.
          </p>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <button className="px-8 py-4 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium flex items-center gap-2 mx-auto transition-all shadow-lg shadow-accent/20 backdrop-blur-sm">
              Agendar Reunião
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};