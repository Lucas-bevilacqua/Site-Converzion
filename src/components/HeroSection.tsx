import { motion } from "framer-motion";
import { ArrowRight, Brain, Sparkles, Bot, Cpu, MessageSquare, Zap, CircuitBoard, Database, ChartBar, TrendingUp, Building2, LogIn } from "lucide-react";
import { useState } from "react";
import { LeadCaptureForm } from "./LeadCaptureForm";
import { useNavigate } from "react-router-dom";

export const HeroSection = () => {
  const [showLeadForm, setShowLeadForm] = useState(false);
  const navigate = useNavigate();

  return (
    <section className="min-h-screen flex items-center justify-center bg-tech-pattern py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-muted"></div>
      
      {/* Login button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        onClick={() => navigate('/login')}
        className="absolute top-4 right-4 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-foreground rounded-lg font-medium flex items-center gap-2 transition-all duration-300 backdrop-blur-sm border border-primary/20 z-20"
      >
        <LogIn className="w-4 h-4" />
        Área do Cliente
      </motion.button>
      
      {/* Floating tech elements with business icons */}
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
        <ChartBar size={80} />
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
        <TrendingUp size={100} />
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
        <Building2 size={60} />
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
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 text-accent rounded-full text-sm font-medium mb-4 backdrop-blur-sm border border-accent/20"
          >
            <Brain className="w-4 h-4" />
            Tecnologia de Ponta para Seu Negócio
            <Sparkles className="w-4 h-4" />
          </motion.span>
          
          <div className="relative">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl font-bold text-foreground leading-tight"
            >
              Automatize Suas Vendas.
              <br />
              <span className="text-accent">Maximize Seus Resultados.</span>
            </motion.h1>
          </div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Transforme seu processo de vendas com nossa solução empresarial de IA. 
            Aumente a eficiência, reduza custos e potencialize o crescimento do seu negócio 
            com automação inteligente.
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
              className="px-8 py-4 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium flex items-center gap-2 transition-all duration-300 shadow-lg shadow-accent/20 backdrop-blur-sm w-full sm:w-auto justify-center"
              onClick={() => {
                const element = document.querySelector('#agendar-reuniao');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Agendar Demonstração
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 border border-primary/20 hover:border-primary/40 text-primary rounded-lg font-medium flex items-center gap-2 transition-all duration-300 backdrop-blur-sm w-full sm:w-auto justify-center"
              onClick={() => setShowLeadForm(true)}
            >
              <MessageSquare className="w-4 h-4" />
              Conhecer a Solução
            </motion.button>
          </motion.div>

          {/* Business metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="p-6 rounded-xl bg-primary/5 backdrop-blur-sm border border-primary/10"
            >
              <h3 className="text-3xl font-bold text-accent mb-2">+150%</h3>
              <p className="text-gray-300">Aumento médio em conversões</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="p-6 rounded-xl bg-primary/5 backdrop-blur-sm border border-primary/10"
            >
              <h3 className="text-3xl font-bold text-accent mb-2">-40%</h3>
              <p className="text-gray-300">Redução em custos operacionais</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="p-6 rounded-xl bg-primary/5 backdrop-blur-sm border border-primary/10"
            >
              <h3 className="text-3xl font-bold text-accent mb-2">24/7</h3>
              <p className="text-gray-300">Atendimento automatizado</p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <LeadCaptureForm 
        open={showLeadForm} 
        onOpenChange={setShowLeadForm}
      />
    </section>
  );
};