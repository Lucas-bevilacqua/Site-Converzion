import { motion } from "framer-motion";
import { MessageSquare, Settings, LineChart, Sparkles } from "lucide-react";

const benefits = [
  {
    icon: MessageSquare,
    title: "Respostas Automáticas com IA",
    description: "Automatize o atendimento com respostas personalizadas que aumentam a conversão e melhoram a experiência do cliente."
  },
  {
    icon: Settings,
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
    <section className="py-20 px-4 bg-background relative">
      <div className="absolute inset-0 bg-tech-pattern opacity-50"></div>
      <div className="container max-w-6xl relative">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-6 h-6 text-primary" />
            Por que Escolher o Converzion?
            <Sparkles className="w-6 h-6 text-primary" />
          </motion.h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="p-6 rounded-xl bg-muted backdrop-blur-lg border border-primary/10 hover:border-primary/30 transition-all duration-300 shadow-lg"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <benefit.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">{benefit.title}</h3>
              <p className="text-gray-300">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};