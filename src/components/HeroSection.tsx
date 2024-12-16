import { motion } from "framer-motion";
import { ArrowRight, Brain, Sparkles, Bot, Cpu, MessageSquare, Zap, CircuitBoard, Database } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-tech-pattern py-20 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-muted"></div>
      
      {/* Floating tech elements */}
      <motion.div 
        animate={{ 
          rotate: 360,
          y: [0, -20, 0],
        }}
        transition={{ 
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }}
        className="absolute top-20 left-10 text-primary/20"
      >
        <CircuitBoard size={80} />
      </motion.div>
      
      <motion.div 
        animate={{ 
          rotate: -360,
          x: [0, 20, 0]
        }}
        transition={{ 
          rotate: { duration: 25, repeat: Infinity, ease: "linear" },
          x: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
        className="absolute bottom-20 right-10 text-accent/20"
      >
        <Database size={100} />
      </motion.div>

      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/3 right-1/4 text-primary/10"
      >
        <Cpu size={60} />
      </motion.div>

      <motion.div 
        animate={{ 
          y: [-15, 15],
          rotate: 180
        }}
        transition={{ 
          y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 20, repeat: Infinity, ease: "linear" }
        }}
        className="absolute bottom-1/3 left-1/4 text-accent/10"
      >
        <Bot size={70} />
      </motion.div>
      
      <div className="container max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-8"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4 backdrop-blur-sm border border-primary/20"
          >
            <Brain className="w-4 h-4" />
            Inteligência Artificial para Vendas
            <Sparkles className="w-4 h-4" />
          </motion.span>
          
          <div className="relative">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl font-bold text-foreground leading-tight"
            >
              Vendas Automatizadas.
              <br />
              <span className="text-primary animate-pulse">Experiências Inesquecíveis.</span>
            </motion.h1>
            
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-8 -right-8 text-primary/20"
            >
              <Zap size={64} />
            </motion.div>
          </div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Com o Converzion, transforme cada interação com seus leads em oportunidades reais. 
            Nossa inteligência artificial cria experiências personalizadas que engajam, 
            convertem e encantam.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium flex items-center gap-2 transition-all duration-300 shadow-lg shadow-accent/20 backdrop-blur-sm"
            >
              Solicitar Diagnóstico Personalizado
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            
            <motion.a
              href="#como-funciona"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 border border-primary/20 hover:border-primary/40 text-primary rounded-lg font-medium flex items-center gap-2 transition-all duration-300 backdrop-blur-sm"
            >
              <MessageSquare className="w-4 h-4" />
              Ver Como Funciona
            </motion.a>
          </motion.div>

          {/* Tech decoration */}
          <div className="absolute -bottom-10 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent"></div>
        </motion.div>
      </div>
    </section>
  );
};