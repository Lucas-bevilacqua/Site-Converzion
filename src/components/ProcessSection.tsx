import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, Target, Code2, Rocket, Zap, Bot, Cpu } from "lucide-react";

const steps = [
  {
    icon: Target,
    title: "Reunião de Diagnóstico Personalizado",
    description: "Analisamos seu processo de vendas, público-alvo e desafios para criar uma solução sob medida para você."
  },
  {
    icon: Bot,
    title: "Construção do Agente de IA Personalizado",
    description: "Desenvolvemos um agente de inteligência artificial específico para o seu negócio, com respostas alinhadas ao seu tom de voz e objetivos."
  },
  {
    icon: Code2,
    title: "Implementação e Testes Monitorados",
    description: "Testamos a automação em um ambiente controlado, ajustando cada detalhe em colaboração com você."
  },
  {
    icon: Rocket,
    title: "Lançamento e Validação em Tempo Real",
    description: "Após os testes, colocamos o sistema em operação e monitoramos os resultados para garantir conversões crescentes."
  }
];

export const ProcessSection = () => {
  return (
    <section className="py-20 px-4 bg-muted relative overflow-hidden">
      <div className="absolute inset-0 bg-tech-pattern opacity-50"></div>
      
      {/* Animated tech elements */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute top-20 right-10 text-primary/10"
      >
        <Cpu size={120} />
      </motion.div>
      
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-20 left-10 text-accent/10"
      >
        <Zap size={100} />
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
            Nosso Processo em 4 Etapas
            <Sparkles className="w-6 h-6 text-primary" />
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            No Converzion, seguimos um processo estratégico que garante resultados reais, 
            sempre adaptado ao seu negócio.
          </p>
        </motion.div>

        <div className="space-y-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="flex items-start gap-4 bg-background/50 backdrop-blur-lg p-6 rounded-xl border border-primary/10 hover:border-primary/30 transition-all shadow-lg group"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{step.title}</h3>
                <p className="text-gray-300">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};