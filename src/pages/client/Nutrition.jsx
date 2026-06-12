import { useState } from 'react'

const MOOV_GREEN = '#39E229'

const SECTIONS = [
  {
    id: 'sport',
    title: 'Nutrition par sport',
    emoji: '🏅',
    items: [
      {
        title: '🏃 Course à pied',
        content: [
          'Hydratation clé : boire 500 ml dans les 2h avant la sortie, puis 150-200 ml toutes les 20 min pendant l\'effort.',
          'Glucides avant : privilégiez des glucides à index glycémique modéré (pâtes, riz, avoine) 2-3h avant.',
          'Récupération : protéines dans les 30 min après l\'effort (yaourt, shake protéiné, œufs) pour réparer les fibres musculaires.',
          'Exemple repas pré-sortie : bol de porridge avec banane et miel, 2h avant.',
        ],
      },
      {
        title: '🚴 Vélo / Home trainer',
        content: [
          'Réserves de glycogène : chargez vos réserves 24-48h avant une longue sortie (pasta, riz, patate douce).',
          'Ravitaillement en ride : pour les sorties >90 min, consommez 30-60g de glucides/heure (banane, barre, gel).',
          'Électrolytes : sueur abondante = pertes en sodium/potassium. Boisson isotonique ou pastilles électrolytes.',
          'Hydratation : au minimum 500 ml/heure, plus par forte chaleur.',
        ],
      },
      {
        title: '🏊 Natation',
        content: [
          'Repas léger 2h avant : digestion lente en eau. Évitez les repas lourds ou riches en graisses.',
          'Hydratation active : en piscine, la sensation de soif est atténuée. Buvez régulièrement sans attendre la soif.',
          'Oméga-3 : particulièrement bénéfiques pour les nageurs — réduction de l\'inflammation, récupération musculaire. Sources : poisson gras, graines de lin, noix.',
          'Post-séance : smoothie protéiné avec fruits pour une récupération optimale.',
        ],
      },
      {
        title: '💪 Renforcement musculaire',
        content: [
          'Protéines : visez 1,6 à 2g de protéines par kg de poids corporel par jour pour une prise de masse ou maintien musculaire.',
          'Créatine monohydrate : 3-5g/jour, le complément le plus étudié et efficace pour la force et la masse musculaire.',
          'Glucides post-séance : consommez des glucides rapides (riz blanc, pain blanc, fruits) dans les 30 min après l\'entraînement pour recharger le glycogène.',
          'Timing protéines : répartissez votre apport en protéines sur 4-5 prises de 20-40g tout au long de la journée.',
        ],
      },
    ],
  },
  {
    id: 'timing',
    title: 'Nutrition par moment',
    emoji: '⏰',
    items: [
      {
        title: 'Avant l\'entraînement (2-3h avant)',
        content: [
          'Glucides complexes : riz, pâtes, pain complet, flocons d\'avoine pour une énergie durable.',
          'Protéines légères : blanc de poulet, œufs, fromage blanc pour soutenir la synthèse musculaire.',
          'Évitez les graisses et fibres en excès : ralentissent la digestion et peuvent causer des inconforts.',
          'Si <1h avant : petite collation légère (banane, compote, quelques dattes).',
        ],
      },
      {
        title: 'Pendant l\'entraînement (>60 min)',
        content: [
          'Boisson isotonique : eau + glucides + électrolytes pour maintenir les performances.',
          'Gels énergétiques si besoin : 1 gel/45 min pour les efforts intenses de longue durée.',
          'Eau régulière : minimum 400-600 ml/heure selon l\'intensité et la chaleur.',
          'Évitez les aliments solides difficiles à digérer pendant l\'effort.',
        ],
      },
      {
        title: 'Après l\'entraînement (fenêtre 30 min)',
        content: [
          'Fenêtre anabolique : les 30 minutes post-effort sont idéales pour la récupération musculaire.',
          'Combo gagnant : protéines + glucides rapides (ex. shake protéiné + banane, yaourt grec + miel).',
          'Réhydratation : buvez 1,5x le poids perdu en eau (pesez-vous avant/après pour estimer les pertes).',
          'Anti-inflammatoires naturels : curcuma, cerises, myrtilles, gingembre pour réduire les courbatures.',
        ],
      },
    ],
  },
  {
    id: 'periods',
    title: 'Périodes spéciales',
    emoji: '📅',
    items: [
      {
        title: 'Semaines d\'entraînement intensif',
        content: [
          'Alimentation équilibrée : 50-60% glucides, 20-25% protéines, 20-25% lipides de qualité.',
          'Augmentez les glucides selon la charge : plus la semaine est intense, plus vous avez besoin de carburant.',
          'Récupération active : privilégiez les aliments anti-inflammatoires (poissons gras, légumes colorés, huile d\'olive).',
          'Sommeil + nutrition : ne négligez pas la qualité du sommeil pour l\'assimilation des nutriments.',
        ],
      },
      {
        title: 'Pré-compétition (3 jours avant)',
        content: [
          'Charge glucidique progressive : augmentez les glucides de 60 à 70% des calories les 3 jours précédant l\'épreuve.',
          'Réduire l\'entraînement + augmenter les glucides = réserves de glycogène maximisées.',
          'Hydratation préventive : 2-3 litres d\'eau/jour, urine claire comme indicateur.',
          'Évitez les nouveaux aliments : pas d\'expérimentation dans les 3 jours avant une compétition.',
        ],
      },
      {
        title: 'Jour de compétition',
        content: [
          'Repas connu et testé : mangez uniquement ce que votre corps connaît et tolère bien.',
          'Digestion facile : 3-4h avant le départ, repas de glucides complexes avec peu de graisses et fibres.',
          'Pas d\'expérimentation : jamais de nouveau produit, gel, boisson ou aliment le jour J.',
          'Rituel alimentaire : créez une routine que vous répétez à chaque compétition pour la confiance et la performance.',
        ],
      },
    ],
  },
]

function AccordionSection({ section }) {
  const [openItems, setOpenItems] = useState([])

  function toggleItem(id) {
    setOpenItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b"
        style={{ backgroundColor: '#f0fdf4' }}>
        <h2 className="font-bold text-base flex items-center gap-2">
          <span>{section.emoji}</span>
          <span style={{ color: '#166534' }}>{section.title}</span>
        </h2>
      </div>
      <div className="divide-y">
        {section.items.map((item, idx) => {
          const isOpen = openItems.includes(idx)
          return (
            <div key={idx}>
              <button
                onClick={() => toggleItem(idx)}
                className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-gray-50 transition-colors">
                <span className="font-semibold text-sm text-gray-800">{item.title}</span>
                <span className="text-lg ml-2 transition-transform duration-200"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', color: MOOV_GREEN }}>
                  ▾
                </span>
              </button>
              {isOpen && (
                <div className="px-5 pb-4 space-y-2">
                  {item.content.map((line, i) => (
                    <div key={i} className="flex gap-2 text-sm text-gray-700">
                      <span className="mt-1 shrink-0" style={{ color: MOOV_GREEN }}>•</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Nutrition() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border shadow-sm p-5">
        <h1 className="text-xl font-bold text-gray-900 mb-1">🥗 Nutrition sportive</h1>
        <p className="text-sm text-gray-500">
          Conseils personnalisés par sport et par moment pour optimiser vos performances et votre récupération.
        </p>
      </div>

      {SECTIONS.map(section => (
        <AccordionSection key={section.id} section={section} />
      ))}

      <div className="rounded-xl p-4 text-sm text-center"
        style={{ backgroundColor: '#f0fdf4', border: `1px solid ${MOOV_GREEN}` }}>
        <p className="font-semibold text-gray-800 mb-1">💡 Rappel important</p>
        <p className="text-gray-600">
          Ces recommandations sont générales. Pour un plan nutritionnel personnalisé adapté à vos objectifs et conditions médicales, consultez un diététicien-nutritionniste du sport.
        </p>
      </div>
    </div>
  )
}
