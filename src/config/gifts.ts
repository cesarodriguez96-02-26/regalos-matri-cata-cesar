export type GiftOption = {
  id: string;
  title: string;
  description: string;
  amount: number;
  emoji: string;
};

// Puedes editar libremente este listado: nombres, descripciones, montos y emojis.
// Los montos están en pesos chilenos.
export const giftOptions: GiftOption[] = [
  { id: 'brindis-amor', title: 'Brindis por el amor', description: 'Un aporte para celebrar con una copa especial.', amount: 1000, emoji: '🥂' },
  { id: 'cena-romantica', title: 'Cena romántica', description: 'Una cena para recordar nuestros primeros días de casados.', amount: 2000, emoji: '🍝' },
  { id: 'desayuno-luna-miel', title: 'Desayuno de luna de miel', description: 'Un desayuno rico y lento, sin apuros.', amount: 3000, emoji: '☕' },
  { id: 'tour-ciudad', title: 'Paseo por la ciudad', description: 'Una experiencia para conocer un lugar nuevo juntos.', amount: 4000, emoji: '🚶' },
  { id: 'noche-hotel', title: 'Noche especial', description: 'Una noche de descanso y celebración.', amount: 20000, emoji: '🏨' },
  { id: 'spa-pareja', title: 'Spa para dos', description: 'Un momento para relajarnos después del matrimonio.', amount: 40000, emoji: '🧖' },
  { id: 'aventura', title: 'Aventura compartida', description: 'Una actividad entretenida para vivir algo distinto.', amount: 70000, emoji: '🌄' },
  { id: 'pasajes-internos', title: 'Pasajes internos', description: 'Ayuda para movernos durante nuestra luna de miel.', amount: 100000, emoji: '✈️' },
  { id: 'experiencia-gourmet', title: 'Experiencia gourmet', description: 'Una comida memorable para brindar por ustedes.', amount: 250000, emoji: '🍷' },
  { id: 'gran-recuerdo', title: 'Gran recuerdo de luna de miel', description: 'Un regalo simbólico para una experiencia inolvidable.', amount: 300000, emoji: '💛' }
];
