import { motion } from "framer-motion";
import { MessageSquare, Settings, LineChart, Sparkles, Bot, Zap, Target, CircuitBoard, Database, Cpu } from "lucide-react";

const benefits = [
  {
    icon: Bot,
    title: "Respostas Automáticas com IA",
    description: "Automatize o atendimento com respostas personalizadas que aumentam a conversão e melhoram a experiência do cliente."
  },
  {
    icon: Target,
    title: "Soluções Sob Medida",
    description: "Cada automação é construída com base nas necessidades e objetivos únicos do seu negócio."
  },
  {
    icon: LineChart,
    title: "Monitoramento e Ajustes Contínuos",
    description: "Nossa equipe acompanha de perto os resultados para garantir a máxima eficiência e conversão."
  }
];

export const BenefitsSection = () => {
  return (
    <section className="py-20 px-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-tech-pattern opacity-50"></div>
      
      {/* Background image */}
      <div 
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1497604401993-f2e922e5cb0a)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'grayscale(50%)'
        }}
      ></div>
      
      <motion.div 
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
        className="absolute top-20 left-10 text-primary/10"
      >
        <Settings size={80} />
      </motion.div>
      
      <motion.div 
        animate={{ 
          rotate: -360,
          y: [-20, 20, -20]
        }}
        transition={{ 
          rotate: { duration: 25, repeat: Infinity, ease: "linear" },
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
        }}
        className="absolute bottom-20 right-10 text-accent/10"
      >
        <Zap size={100} />
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
        <CircuitBoard size={120} />
      </motion.div>

      <motion.div 
        animate={{ 
          rotate: 180,
          x: [-10, 10, -10]
        }}
        transition={{ 
          rotate: { duration: 15, repeat: Infinity, ease: "linear" },
          x: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }}
        className="absolute bottom-1/3 left-1/4 text-accent/10"
      >
        <Database size={90} />
      </motion.div>
      
      <div className="container max-w-6xl relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center lg:text-left"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 flex items-center justify-center lg:justify-start gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Por que Escolher o Converzion?
              <Sparkles className="w-6 h-6 text-primary" />
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto lg:mx-0">
              Descubra como nossa tecnologia pode revolucionar seu atendimento
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative hidden lg:block"
          >
            <img 
              src="https://images.unsplash.com/photo-1581092795360-fd1ca04f0952" 
              alt="Professional business environment" 
              className="rounded-xl shadow-lg"
            />
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-xl bg-muted/80 backdrop-blur-lg border border-primary/10 hover:border-primary/30 transition-all duration-300 shadow-lg group relative overflow-hidden"
            >
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">{benefit.title}</h3>
                <p className="text-gray-300">{benefit.description}</p>
              </div>

              {/* Tech decoration */}
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute -bottom-6 -right-6 text-primary/5"
              >
                <Cpu size={80} />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
