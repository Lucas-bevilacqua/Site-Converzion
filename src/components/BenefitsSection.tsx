import { motion } from "framer-motion";
import { MessageSquare, Settings, LineChart } from "lucide-react";

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
    <section className="py-20 px-4 bg-white">
      <div className="container max-w-6xl">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            Por que Escolher o Converzion?
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
              className="p-6 rounded-xl bg-muted hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <benefit.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};