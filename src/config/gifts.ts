export type GiftOption = {
  id: string;
  title: string;
  description: string;
  amount: number;
  emoji: string;
};

// Precios de aportes simbólicos en pesos chilenos. La selección se calcula
// de nuevo en el servidor antes de crear un cobro con Flow.
export const giftOptions: GiftOption[] = [
  { id: "duelo-amor-estrategia", title: "Duelo de amor y estrategia", description: "Nuevos juegos de mesa para dos. Porque el amor es infinito, pero la competencia también.", amount: 400, emoji: "🎲" },
  { id: "tour-cervecero", title: "Tour cervecero para dos", description: "Nuevas cervezas, buenos brindis y la difícil misión de encontrar nuestra favorita.", amount: 600, emoji: "🍻" },
  { id: "bar-en-bar", title: "De bar en bar, de copa en copa", description: "Una noche para descubrir nuevos bares, probar cócteles y brindar por la vida.", amount: 700, emoji: "🍸" },
  { id: "cita-estrellas", title: "Una cita bajo las estrellas", description: "Una cena romántica a la luz de las velas, buena comida y una copa para brindar por nosotros.", amount: 800, emoji: "🕯️" },
  { id: "cesar-rey-pista", title: "César, el próximo rey de la pista", description: "Más clases de baile para que César sorprenda con nuevos pasos y menos improvisación.", amount: 1000, emoji: "🕺" },
  { id: "educar-skyler", title: "Misión imposible: educar a Skyler", description: "Clases de adoctrinamiento para nuestra loquita. No prometemos resultados, pero sí muchas risas.", amount: 1100, emoji: "🐾" },
  { id: "cata-world-padel", title: "Cata rumbo al World Padel Tour", description: "Más clases de pádel para que Cata siga perfeccionando su bandeja y soñando con ser profesional.", amount: 1200, emoji: "🎾" },
  { id: "tv-deportiva", title: "Una TV exclusivamente deportiva", description: "Para ver fútbol, tenis y cualquier deporte que aparezca en pantalla. ¡El control remoto ya tiene dueño!", amount: 1500, emoji: "📺" },
  { id: "spa-dos", title: "Modo relax: spa para dos", description: "Masajes, relajo y unas horas sin preocupaciones. ¡Nos las merecemos!", amount: 1800, emoji: "💆" },
  { id: "escapada-improvisada", title: "Una escapada improvisada", description: "Una aventura para desconectarnos de la rutina, descubrir nuevos lugares y seguir coleccionando recuerdos juntos.", amount: 2300, emoji: "✈️" },
  { id: "skyler-luna-miel", title: "Skyler se suma a la luna de miel", description: "Porque no podíamos dejar fuera a la verdadera regalona de esta familia. ¡Luna de miel para tres!", amount: 3000, emoji: "🐶" },
  { id: "futuro-heredero", title: "Proyecto: futuro heredero", description: "¡Se aceptan aportes para este proyecto de largo plazo!", amount: 5000, emoji: "👶" }
];
