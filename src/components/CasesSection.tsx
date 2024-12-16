import { motion } from "framer-motion";
import { Star } from "lucide-react";

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
    <section className="py-20 px-4 bg-white">
      <div className="container max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Transformamos Conversas em Resultados Reais
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
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
              className="p-6 rounded-xl bg-muted hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>
              <h3 className="text-xl font-semibold mb-3">{case_.company}</h3>
              <p className="text-muted-foreground">{case_.result}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};