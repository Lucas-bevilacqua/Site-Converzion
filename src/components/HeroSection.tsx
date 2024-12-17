import { motion } from "framer-motion";
import { ArrowRight, Brain, Sparkles, Bot, Cpu, MessageSquare, Zap, CircuitBoard, Database, ChartBar, TrendingUp, Building2 } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-tech-pattern py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-muted"></div>
      
      {/* Background image */}
      <div 
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1486718448742-163732cd1544)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'grayscale(50%)'
        }}
      ></div>
      
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-left space-y-8"
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
              className="text-lg md:text-xl text-gray-300 max-w-3xl"
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
            <motion.a
              href="#agendar-reuniao"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium flex items-center gap-2 transition-all duration-300 shadow-lg shadow-accent/20 backdrop-blur-sm w-full sm:w-auto justify-center"
              onClick={(e) => {
                e.preventDefault();
                const element = document.querySelector('#agendar-reuniao');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Agendar Demonstração
              <ArrowRight className="w-4 h-4" />
            </motion.a>
            
            <motion.a
              href="#como-funciona"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 border border-primary/20 hover:border-primary/40 text-primary rounded-lg font-medium flex items-center gap-2 transition-all duration-300 backdrop-blur-sm w-full sm:w-auto justify-center"
              onClick={(e) => {
                e.preventDefault();
                const element = document.querySelector('#como-funciona');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <MessageSquare className="w-4 h-4" />
              Conhecer a Solução
            </motion.a>
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

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="relative hidden lg:block"
          >
            <div className="relative rounded-xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1483058712412-4245e9b90334" 
                alt="Modern workspace with technology" 
                className="w-full h-auto rounded-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
