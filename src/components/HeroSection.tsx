import { motion } from "framer-motion";
import { ArrowRight, Brain, Sparkles, Bot, Cpu, MessageSquare, Zap } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-tech-pattern py-20 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent rounded-full filter blur-3xl animate-pulse"></div>
      </div>
      
      {/* Floating tech elements */}
      <motion.div 
        animate={{ y: [-10, 10] }}
        transition={{ repeat: Infinity, repeatType: "reverse", duration: 2 }}
        className="absolute top-1/4 left-10 text-primary/30"
      >
        <Bot size={40} />
      </motion.div>
      
      <motion.div 
        animate={{ y: [-15, 15] }}
        transition={{ repeat: Infinity, repeatType: "reverse", duration: 2.5 }}
        className="absolute top-1/3 right-10 text-accent/30"
      >
        <Cpu size={40} />
      </motion.div>
      
      <motion.div 
        animate={{ y: [-12, 12] }}
        transition={{ repeat: Infinity, repeatType: "reverse", duration: 3 }}
        className="absolute bottom-1/4 left-20 text-primary/30"
      >
        <MessageSquare size={40} />
      </motion.div>
      
      <div className="container max-w-6xl relative">
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
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4"
          >
            <Brain className="w-4 h-4" />
            Inteligência Artificial para Vendas
            <Sparkles className="w-4 h-4" />
          </motion.span>
          
          <div className="relative">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
              Transforme Conversas em
              <span className="text-primary animate-glow ml-2">Vendas</span>
            </h1>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-8 -right-8 text-primary/20"
            >
              <Zap size={64} />
            </motion.div>
          </div>
          
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Aumente vendas, automatize atendimento e ofereça experiências personalizadas 
            com o Converzion utilizando inteligência artificial.
          </p>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <button className="px-8 py-4 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium flex items-center gap-2 mx-auto transition-all shadow-lg shadow-accent/20">
              Agendar Reunião
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Tech decoration */}
          <div className="absolute -bottom-10 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent"></div>
        </motion.div>
      </div>
    </section>
  );
};