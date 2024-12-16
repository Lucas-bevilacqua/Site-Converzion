import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white to-muted">
      <div className="container max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-6"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Pronto para Transformar Suas Conversas em Vendas Reais?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Solicite uma reunião estratégica e descubra como o Converzion pode 
            revolucionar suas vendas pelo WhatsApp. Nossa equipe está pronta para 
            criar uma solução sob medida para o seu negócio.
          </p>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <button className="px-8 py-4 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium flex items-center gap-2 mx-auto transition-all">
              Agendar Reunião
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};