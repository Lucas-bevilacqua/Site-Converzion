import { motion } from "framer-motion";
import { Star, Sparkles, CircuitBoard, Database, Cpu, Bot } from "lucide-react";

const cases = [
  {
    company: "Empresa A",
    result: "Reduzimos o tempo de resposta em 80% e aumentamos as conversões em 35%."
  },
  {
    company: "Empresa B",
    result: "A automação personalizada do Converzion nos permitiu escalar o atendimento e triplicar as vendas em apenas 3 meses."
  },
  {
    company: "Empresa C",
    result: "Com o suporte contínuo da equipe Converzion, estamos alcançando resultados consistentes e escaláveis."
  }
];

export const CasesSection = () => {
  return (
    <section className="py-20 px-4 bg-background relative">
      <div className="absolute inset-0 bg-tech-pattern opacity-50"></div>

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
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Transformamos Conversas em Resultados Reais
            <Sparkles className="w-6 h-6 text-primary" />
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Descubra como ajudamos empresas a revolucionar suas vendas automatizadas.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cases.map((case_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-xl bg-muted backdrop-blur-lg border border-primary/10 hover:border-primary/30 transition-all duration-300 shadow-lg group relative overflow-hidden"
            >
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">{case_.company}</h3>
                <p className="text-gray-300">{case_.result}</p>
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