const MOOV_GREEN = '#39E229'

const LIFESTYLE_CARDS = [
  {
    emoji: '😴',
    title: 'Repos',
    color: '#6366f1',
    tips: [
      '7 à 9 heures de sommeil par nuit pour une récupération optimale',
      'Sommeil réparateur : les phases de sommeil profond reconstruisent les muscles',
      'Régularité des horaires : coucher et lever à la même heure, même le week-end',
      'Évitez les écrans (téléphone, TV, tablette) au moins 1h avant de dormir',
      'Chambre fraîche (18-19°C), sombre et calme pour un meilleur endormissement',
    ],
  },
  {
    emoji: '🧘',
    title: 'Méditation',
    color: '#8b5cf6',
    tips: [
      '10 minutes par jour minimum — la régularité prime sur la durée',
      'Applications recommandées : Petit Bambou, Calm, Headspace, Insight Timer',
      'Cohérence cardiaque : technique 5-3-5 (inspiration 5s, pause 3s, expiration 5s) — pratiquez 3×/jour',
      'Méditation de pleine conscience : focalisez-vous sur les sensations corporelles après l\'entraînement',
      'Corps scan avant de dormir : relâchez chaque groupe musculaire de la tête aux pieds',
    ],
  },
  {
    emoji: '🛁',
    title: 'Relaxation',
    color: '#0ea5e9',
    tips: [
      'Bain chaud post-entraînement (38-40°C) : réduit les courbatures et favorise la récupération',
      'Étirements doux après l\'effort : 15-30s par muscle, sans douleur, en respirant',
      'Musique relaxante pendant la récupération : aide à faire baisser le cortisol',
      'Massage de récupération : foam roller, balles de massage ou séances professionnelles',
      'Respiration abdominale : activez le système nerveux parasympathique pour déstresser',
    ],
  },
  {
    emoji: '👨‍👩‍👧',
    title: 'Famille & Social',
    color: '#f97316',
    tips: [
      'Partagez vos objectifs sportifs avec vos proches pour créer un environnement de soutien',
      'Impliquez votre famille : proposez des activités physiques ensemble (vélo, randonnée)',
      'Communautés : rejoignez des groupes de running, clubs sportifs, forums en ligne',
      'Partenaire d\'entraînement : courir ou s\'entraîner à deux augmente la régularité',
      'Célébrez vos progrès avec vos proches — chaque victoire mérite d\'être partagée',
    ],
  },
  {
    emoji: '⏰',
    title: 'Gestion du temps',
    color: '#eab308',
    tips: [
      'Planifiez vos séances comme des rendez-vous médicaux : bloquez le créneau dans votre agenda',
      'Blocs dédiés à l\'entraînement : soyez non-négociable avec ces plages horaires',
      'Préparez votre sac de sport la veille pour éviter les excuses le matin',
      'Règle des 2 minutes : si vous hésitez, enfilez votre tenue — vous partirez toujours',
      'Priorités hebdomadaires : identifiez les 3 séances incontournables de votre semaine',
    ],
  },
  {
    emoji: '💚',
    title: 'Mindset positif',
    color: '#10b981',
    tips: [
      'Célébrez les petites victoires : chaque séance terminée est un succès',
      'Journal de progression : notez vos ressentis, performances et émotions après chaque entraînement',
      'Affirmations matinales : commencez la journée avec des intentions positives sur votre entraînement',
      'Visualisation : imaginez-vous réussir vos objectifs sportifs avec précision et émotion',
      'Erreurs = apprentissages : une séance ratée est une information, pas un échec',
    ],
  },
]

function LifestyleCard({ card }) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <div className="flex gap-3 p-4 border-b"
        style={{ borderLeft: `4px solid ${card.color}`, backgroundColor: '#fafafa' }}>
        <span className="text-2xl">{card.emoji}</span>
        <h3 className="font-bold text-base text-gray-900 self-center">{card.title}</h3>
      </div>
      <ul className="divide-y">
        {card.tips.map((tip, i) => (
          <li key={i} className="flex gap-3 px-4 py-3 text-sm text-gray-700">
            <span className="shrink-0 mt-0.5" style={{ color: MOOV_GREEN }}>✓</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Lifestyle() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border shadow-sm p-5">
        <h1 className="text-xl font-bold text-gray-900 mb-1">🌿 Bien-être & Lifestyle</h1>
        <p className="text-sm text-gray-500">
          La performance sportive va bien au-delà de l'entraînement. Adoptez ces habitudes pour maximiser vos résultats et votre bien-être au quotidien.
        </p>
      </div>

      {LIFESTYLE_CARDS.map(card => (
        <LifestyleCard key={card.title} card={card} />
      ))}

      <div className="rounded-xl p-4 text-sm"
        style={{ backgroundColor: '#f0fdf4', border: `1px solid ${MOOV_GREEN}` }}>
        <p className="font-semibold text-gray-800 mb-2">💚 La règle des 1%</p>
        <p className="text-gray-600">
          Améliorer chaque habitude de seulement 1% par jour mène à une progression de 37x sur un an. La régularité et la constance l'emportent toujours sur l'intensité ponctuelle. Commencez petit, soyez régulier.
        </p>
      </div>
    </div>
  )
}
