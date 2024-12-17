import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CircuitBoard, Database, Bot, Building2, TrendingUp, ChartBar } from "lucide-react";
import { useState } from "react";
import { LeadCaptureForm } from "./LeadCaptureForm";

export const CTASection = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <section id="agendar-reuniao" className="py-20 px-4 bg-tech-pattern relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-muted opacity-50"></div>

      {/* Animated business elements */}
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
        <ChartBar size={100} />
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
        <TrendingUp size={120} />
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
        <Building2 size={80} />
      </motion.div>
      
      <div className="container max-w-6xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-6"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-accent" />
            Maximize o Potencial do Seu Negócio
            <Sparkles className="w-6 h-6 text-accent" />
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Agende uma demonstração personalizada e descubra como nossa solução pode 
            transformar sua operação de vendas. Nossa equipe de especialistas está 
            pronta para mostrar resultados reais para seu setor.
          </p>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <button 
              onClick={() => setIsFormOpen(true)}
              className="px-8 py-4 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium flex items-center gap-2 mx-auto transition-all shadow-lg shadow-accent/20 backdrop-blur-sm"
            >
              Agendar Demonstração
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Business metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 rounded-xl bg-primary/5 backdrop-blur-sm border border-primary/10">
              <h4 className="text-xl font-semibold text-accent mb-2">ROI Comprovado</h4>
              <p className="text-gray-300">Retorno sobre investimento mensurável desde o primeiro mês</p>
            </div>
            <div className="p-6 rounded-xl bg-primary/5 backdrop-blur-sm border border-primary/10">
              <h4 className="text-xl font-semibold text-accent mb-2">Implementação Rápida</h4>
              <p className="text-gray-300">Setup completo em até 48 horas</p>
            </div>
            <div className="p-6 rounded-xl bg-primary/5 backdrop-blur-sm border border-primary/10">
              <h4 className="text-xl font-semibold text-accent mb-2">Suporte Especializado</h4>
              <p className="text-gray-300">Acompanhamento dedicado para sua empresa</p>
            </div>
          </div>
        </motion.div>
      </div>

      <LeadCaptureForm open={isFormOpen} onOpenChange={setIsFormOpen} />
    </section>
  );
};