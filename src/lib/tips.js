// Motivational tips system — 2x/week conseil personnalisé selon les objectifs du client.

export const OBJECTIVES = [
  {
    id: 1,
    icon: '🏊',
    title: 'Triathlon',
    subtitle: 'Premier triathlon · Distance olympique · Progresser en vitesse',
  },
]

export function getNextTip(selectedObjectiveIds, shownIds = []) {
  const eligible = TIPS.filter(t => t.objectiveIds.some(id => selectedObjectiveIds.includes(id)))
  if (eligible.length === 0) return null
  const unseen = eligible.filter(t => !shownIds.includes(t.id))
  const pool = unseen.length > 0 ? unseen : eligible // cycle quand tout vu
  return pool[Math.floor(Math.random() * pool.length)]
}

export const TIPS = [
  // ── ENTRAÎNEMENT GÉNÉRAL ────────────────────────────────────────────────
  {
    id: 1, objectiveIds: [1], category: 'Entraînement',
    title: 'Privilégiez la régularité à la quantité',
    body: "Il est préférable de s'entraîner régulièrement 3 à 4 fois par semaine plutôt que de faire de trop grosses séances irrégulières.",
  },
  {
    id: 2, objectiveIds: [1], category: 'Équipement',
    title: 'Ne testez rien de nouveau le jour J',
    body: "N'utilisez jamais un équipement neuf (chaussures, combinaison) ou une nutrition inconnue (gels, barres) le jour de la course.",
  },
  {
    id: 3, objectiveIds: [1], category: 'Équipement',
    title: 'Achetez une ceinture porte-dossard',
    body: "Elle vous évitera de percer vos vêtements et vous permettra de basculer facilement le dossard dans le dos à vélo, puis devant pour la course à pied.",
  },
  {
    id: 4, objectiveIds: [1], category: 'Équipement',
    title: 'Investissez dans une trifonction',
    body: "C'est une tenue unique qui sèche rapidement après la natation, possède une peau de chamois fine pour le vélo, et se fait oublier pendant la course à pied.",
  },
  {
    id: 5, objectiveIds: [1], category: 'Entraînement',
    title: 'Pratiquez les enchaînements',
    body: "Réalisez de courtes séances de course à pied (10 à 15 minutes) immédiatement après une sortie vélo pour habituer vos cuisses à la transition.",
  },
  {
    id: 6, objectiveIds: [1], category: 'Équipement',
    title: "N'achetez pas de matériel haut de gamme pour débuter",
    body: "Un équipement de base (votre vélo actuel, une combinaison abordable, une bonne paire de baskets) est amplement suffisant pour un premier triathlon.",
  },
  {
    id: 7, objectiveIds: [1], category: 'Natation',
    title: 'Domptez la natation en eau libre',
    body: "Nager en milieu naturel est très différent de la piscine. Entraînez-vous à lever la tête pour vous orienter et apprivoisez les sensations de la combinaison en néoprène.",
  },
  {
    id: 8, objectiveIds: [1], category: 'Entraînement',
    title: 'Maîtrisez la distance à l'entraînement',
    body: "Assurez-vous de pouvoir valider séparément chaque distance (nager 1 500 m, rouler 40 km, courir 10 km) bien avant la course.",
  },
  {
    id: 9, objectiveIds: [1], category: 'Cyclisme',
    title: 'Gérez votre allure à vélo',
    body: "Le vélo représente la section la plus longue. Ne roulez pas au-dessus de vos moyens pour ne pas vous effondrer lors des 10 km de course à pied.",
  },
  {
    id: 10, objectiveIds: [1], category: 'Nutrition',
    title: 'Planifiez votre nutrition',
    body: "Sur une épreuve de 2h15 à 3h30 pour un débutant, vous devez vous alimenter en glucides et en sodium, principalement durant la partie cycliste.",
  },
  {
    id: 11, objectiveIds: [1], category: 'Logistique',
    title: 'Mémorisez le parc de transition',
    body: "Repérez visuellement l'emplacement exact de votre vélo par rapport aux entrées et sorties de la zone de transition avant le départ.",
  },
  {
    id: 12, objectiveIds: [1], category: 'Entraînement',
    title: 'Intégrez du fractionné pour gagner en vitesse',
    body: "Augmentez votre VO2 max avec des séances de haute intensité : séries de 400 m sur piste ou intervalles sur home-trainer.",
  },
  {
    id: 13, objectiveIds: [1], category: 'Entraînement',
    title: 'Travaillez les enchaînements à allure course',
    body: "Intégrez des blocs de transition dynamiques : 10 km de vélo à allure course suivis immédiatement de 2 km de course à pied à allure cible.",
  },
  {
    id: 14, objectiveIds: [1], category: 'Entraînement',
    title: 'Renforcez votre posture (PPG)',
    body: "Le renforcement musculaire (gainage, squats, fentes) empêche votre foulée de se dégrader en fin de course à pied à cause de la fatigue.",
  },
  {
    id: 15, objectiveIds: [1], category: 'Transitions',
    title: 'Optimisez vos transitions',
    body: "Lacets élastiques à serrage rapide, retrait de combinaison en courant : chaque seconde gagnée en T1 et T2 s'accumule sur la durée totale.",
  },
  {
    id: 16, objectiveIds: [1], category: 'Cyclisme',
    title: 'Soignez l'aérodynamisme',
    body: "Des prolongateurs sur votre guidon de route vous aident à fendre l'air plus efficacement et à économiser de précieuses minutes sur le plat.",
  },
  // ── NATATION ─────────────────────────────────────────────────────────────
  {
    id: 17, objectiveIds: [1], category: 'Natation',
    title: 'Maîtrisez le sighting',
    body: "En eau libre, relevez la tête toutes les 6 à 10 brasses pour vérifier votre trajectoire et éviter de nager en zigzag.",
  },
  {
    id: 18, objectiveIds: [1], category: 'Natation',
    title: 'Apprenez à nager dans une combinaison',
    body: "La combinaison augmente la flottabilité mais peut restreindre les épaules. Portez-la plusieurs fois à l'entraînement avant la course.",
  },
  {
    id: 19, objectiveIds: [1], category: 'Natation',
    title: 'Gérez votre départ de masse',
    body: "Positionnez-vous sur les côtés si vous êtes débutant. Le centre est plus rapide mais plus chaotique. Avec l'expérience, rapprochez-vous du centre pour aspirer dans les sillages.",
  },
  {
    id: 20, objectiveIds: [1], category: 'Natation',
    title: 'Travaillez la respiration bilatérale',
    body: "Respirer des deux côtés vous rend plus symétrique dans l'eau et vous permet de gérer les vagues quelle que soit leur direction.",
  },
  {
    id: 21, objectiveIds: [1], category: 'Natation',
    title: 'Améliorez votre prise d'appui',
    body: "Concentrez-vous sur la phase de traction sous l'eau plutôt que sur votre fréquence. Une bonne prise d'appui propulse plus efficacement à chaque coup de bras.",
  },
  {
    id: 22, objectiveIds: [1], category: 'Natation',
    title: 'Entraînez-vous dans l'eau froide',
    body: "Si votre course a lieu en début de saison, adaptez progressivement votre corps aux basses températures pour éviter le choc thermique au départ.",
  },
  {
    id: 23, objectiveIds: [1], category: 'Natation',
    title: 'Nagez en groupe à l'entraînement',
    body: "Reproduire les conditions de course vous apprend à gérer les contacts et à profiter du sillage des nageurs devant vous.",
  },
  {
    id: 24, objectiveIds: [1], category: 'Natation',
    title: 'Maintenez vos hanches en surface',
    body: "Si vos jambes coulent, vous créez une résistance majeure. Tendez les orteils vers l'arrière et contractez légèrement les abdominaux.",
  },
  {
    id: 25, objectiveIds: [1], category: 'Natation',
    title: 'Travaillez votre sortie d'eau',
    body: "Entraînez-vous à courir depuis les derniers mètres de natation tout en retirant lunettes et bonnet — vous gagnerez de précieuses secondes en T1.",
  },
  {
    id: 26, objectiveIds: [1], category: 'Natation',
    title: 'Utilisez des palmes courtes à l'entraînement',
    body: "Elles développent la force des jambes et sensibilisent au travail de cheville sans déformer votre technique.",
  },
  {
    id: 27, objectiveIds: [1], category: 'Natation',
    title: 'Intégrez des exercices de technique',
    body: "Consacrez 15 minutes de chaque séance à des exercices spécifiques (catch-up, doigt qui traîne, nage au poing) pour ancrer les bons gestes.",
  },
  {
    id: 28, objectiveIds: [1], category: 'Natation',
    title: 'Planifiez vos virages de bouée',
    body: "Les virages génèrent des embouteillages en course. Commencez votre arc bien avant la bouée pour éviter les bousculades.",
  },
  {
    id: 29, objectiveIds: [1], category: 'Natation',
    title: 'Réduisez votre résistance frontale',
    body: "Regardez le fond plutôt que vers l'avant. La tête dans l'axe du corps réduit la résistance et améliore la flottabilité.",
  },
  {
    id: 30, objectiveIds: [1], category: 'Natation',
    title: 'Recalibrez vos sensations en eau libre',
    body: "Sans la ligne noire du fond, votre cerveau doit adapter ses repères. Faites au moins 2 à 3 sorties en eau libre avant la course.",
  },
  {
    id: 31, objectiveIds: [1], category: 'Natation',
    title: 'Gérez votre énergie sur la natation',
    body: "Partez à 85-90% de votre capacité max. La nage ne représente que 15-20% du temps total — arriver épuisé en T1 compromet tout le reste.",
  },
  // ── CYCLISME ─────────────────────────────────────────────────────────────
  {
    id: 32, objectiveIds: [1], category: 'Cyclisme',
    title: 'Réglez votre position sur le vélo',
    body: "Une mauvaise position entraîne douleurs et pertes de puissance. Faites un bike fitting au moins un mois avant la course.",
  },
  {
    id: 33, objectiveIds: [1], category: 'Cyclisme',
    title: 'Anticipez vos changements de vitesses',
    body: "Passez vos vitesses avant d'arriver dans les côtes, pas pendant. Un changement sous forte charge peut faire sauter la chaîne.",
  },
  {
    id: 34, objectiveIds: [1], category: 'Cyclisme',
    title: 'Connaissez les règles de non-drafting',
    body: "En triathlon, rouler dans le sillage d'un adversaire est interdit hors zone de dépassement. Respectez la règle des 12 mètres.",
  },
  {
    id: 35, objectiveIds: [1], category: 'Cyclisme',
    title: 'Entraînez-vous à manger en roulant',
    body: "Prendre un gel ou une barre sur le vélo en mouvement demande de la pratique. Exercez-vous à l'entraînement.",
  },
  {
    id: 36, objectiveIds: [1], category: 'Cyclisme',
    title: 'Vérifiez votre vélo la veille',
    body: "Gonflez les pneus, vérifiez le dérailleur, les freins et la chaîne. Emportez un kit de réparation le jour J.",
  },
  {
    id: 37, objectiveIds: [1], category: 'Cyclisme',
    title: 'Visez 80-95 tours par minute',
    body: "La plupart des triathlètes amateurs pédalent trop lentement en grosse vitesse. Une cadence plus élevée préserve vos muscles pour la course à pied.",
  },
  {
    id: 38, objectiveIds: [1], category: 'Cyclisme',
    title: 'Gérez votre puissance sur le vélo',
    body: "Sans capteur de puissance, vous devez pouvoir tenir une conversation normale sur le vélo. Au-delà, vous compromettez votre course à pied.",
  },
  {
    id: 39, objectiveIds: [1], category: 'Cyclisme',
    title: 'Pratiquez la prise de bidon en roulant',
    body: "S'hydrater sans ralentir ni perdre l'équilibre demande de l'habitude. Entraînez-vous lors de vos sorties de préparation.",
  },
  {
    id: 40, objectiveIds: [1], category: 'Cyclisme',
    title: 'Roulez sur le parcours avant la course',
    body: "Identifier les difficultés (côtes, virages techniques, revêtement dégradé) vous permet d'adapter votre stratégie de puissance.",
  },
  {
    id: 41, objectiveIds: [1], category: 'Cyclisme',
    title: 'Maîtrisez les descentes en sécurité',
    body: "Ne prenez pas de risques dans les descentes techniques. Quelques secondes gagnées ne valent pas une chute.",
  },
  {
    id: 42, objectiveIds: [1], category: 'Cyclisme',
    title: 'Portez des chaussures vélo avec cales',
    body: "Elles améliorent significativement l'efficacité du pédalage en permettant la traction sur toute la rotation de la pédale.",
  },
  {
    id: 43, objectiveIds: [1], category: 'Cyclisme',
    title: 'Adoptez une position aéro',
    body: "En baissant votre torse et en rentrant les coudes, vous pouvez gagner plusieurs minutes sans effort supplémentaire sur parcours plat.",
  },
  {
    id: 44, objectiveIds: [1], category: 'Cyclisme',
    title: 'Roulez par tous les temps',
    body: "Si votre course peut se dérouler sous la pluie, entraînez-vous dans ces conditions. Le freinage sur sol mouillé demande une adaptation.",
  },
  {
    id: 45, objectiveIds: [1], category: 'Cyclisme',
    title: 'Développez votre force en côte',
    body: "Des séances de climbing développent la puissance musculaire et le VO2 max plus efficacement qu'un effort équivalent sur le plat.",
  },
  {
    id: 46, objectiveIds: [1], category: 'Cyclisme',
    title: 'Récupérez après vos longues sorties vélo',
    body: "Après plus de 90 minutes de vélo, étirez quadriceps, ischio-jambiers et mollets dans les 30 minutes pour réduire les courbatures.",
  },
  // ── COURSE À PIED ────────────────────────────────────────────────────────
  {
    id: 47, objectiveIds: [1], category: 'Course',
    title: 'Courez souvent, pas longtemps',
    body: "Deux courses de 30 minutes développent mieux l'endurance fondamentale qu'une seule sortie de 60 minutes, avec moins de risque de blessure.",
  },
  {
    id: 48, objectiveIds: [1], category: 'Course',
    title: 'Retrouvez votre foulée après le vélo',
    body: "Après le vélo, la foulée est courte et hachée. Concentrez-vous sur l'élévation du genou pour retrouver une mécanique normale dès les premiers hectomètres.",
  },
  {
    id: 49, objectiveIds: [1], category: 'Course',
    title: 'Intégrez du fractionné court',
    body: "Des séries de 200 à 400 m à haute intensité développent votre VMA et votre capacité à accélérer en fin de course.",
  },
  {
    id: 50, objectiveIds: [1], category: 'Course',
    title: 'Progressez sur la sortie longue',
    body: "Augmentez votre sortie longue hebdomadaire de 10% maximum par semaine. Elle développe l'endurance de base et la résistance mentale.",
  },
  {
    id: 51, objectiveIds: [1], category: 'Course',
    title: 'Choisissez vos chaussures avec soin',
    body: "Vos chaussures doivent correspondre à votre morphologie et votre foulée. Faites-vous analyser dans un magasin spécialisé.",
  },
  {
    id: 52, objectiveIds: [1], category: 'Course',
    title: 'Courez par temps chaud',
    body: "Habituez progressivement votre corps à la chaleur si votre course est estivale. Votre fréquence cardiaque sera plus haute — c'est normal.",
  },
  {
    id: 53, objectiveIds: [1], category: 'Course',
    title: 'Visez 170-180 pas par minute',
    body: "Une cadence trop basse signifie souvent une foulée trop longue et des impacts plus violents. Comptez vos pas sur 30 secondes et multipliez par 4.",
  },
  {
    id: 54, objectiveIds: [1], category: 'Course',
    title: 'Synchronisez votre respiration',
    body: "Inspirez sur 3 foulées, expirez sur 2. Ce rythme stabilise la fréquence cardiaque et repousse la fatigue.",
  },
  {
    id: 55, objectiveIds: [1], category: 'Course',
    title: 'Renforcez chevilles et pieds',
    body: "Des exercices de proprioception (équilibre unipodal, planche instable) réduisent les risques de blessures lors des transitions.",
  },
  {
    id: 56, objectiveIds: [1], category: 'Course',
    title: 'Démarrez plus lentement que prévu',
    body: "Les premiers kilomètres après le vélo sont trompeurs. Démarrez 10 à 15 secondes plus lentement que votre allure cible.",
  },
  {
    id: 57, objectiveIds: [1], category: 'Course',
    title: 'Intégrez des séances de côtes',
    body: "Les montées développent la force musculaire et le VO2 max, et préparent le mental à l'effort concentré.",
  },
  {
    id: 58, objectiveIds: [1], category: 'Course',
    title: 'Variez vos surfaces',
    body: "Route, piste, trail — alterner les surfaces renforce les articulations et diversifie les stimuli musculaires, réduisant les syndromes de surutilisation.",
  },
  {
    id: 59, objectiveIds: [1], category: 'Course',
    title: 'Soignez vos pieds avant la course',
    body: "Appliquez de la vaseline sur les zones de frottement et coupez vos ongles une semaine avant la course pour éviter ampoules et douleurs.",
  },
  {
    id: 60, objectiveIds: [1], category: 'Course',
    title: 'Courez à l'allure cible sans montre',
    body: "Entraînez-vous à tenir votre allure par ressenti. Si votre GPS flanche le jour J, vous pouvez toujours gérer votre effort.",
  },
  {
    id: 61, objectiveIds: [1], category: 'Course',
    title: 'Tenez un journal d'entraînement',
    body: "Notez allures, fréquence cardiaque et sensations après chaque séance. Identifier vos tendances guide efficacement votre progression.",
  },
  // ── TRANSITIONS ───────────────────────────────────────────────────────────
  {
    id: 62, objectiveIds: [1], category: 'Transitions',
    title: 'Entraînez-vous à la T1',
    body: "Sortie d'eau, retrait de combinaison, chaussage, départ vélo — répétez cette séquence. Une T1 non préparée peut faire perdre 2 à 3 minutes.",
  },
  {
    id: 63, objectiveIds: [1], category: 'Transitions',
    title: 'Entraînez-vous à la T2',
    body: "Descendre du vélo, poser le casque, enfiler les chaussures de course et partir en courant doit devenir un automatisme.",
  },
  {
    id: 64, objectiveIds: [1], category: 'Transitions',
    title: 'Disposez votre matériel dans l'ordre',
    body: "Dans la zone de transition, votre casque doit être accessible en premier, vos chaussures de course à portée immédiate.",
  },
  {
    id: 65, objectiveIds: [1], category: 'Transitions',
    title: 'Utilisez un repère visuel dans la transition',
    body: "Un sac ou une serviette de couleur vive vous permet de repérer instantanément votre emplacement parmi des centaines de vélos.",
  },
  {
    id: 66, objectiveIds: [1], category: 'Transitions',
    title: 'Préparez vos chaussures en avance',
    body: "Des lacets élastiques ou des chaussures légèrement desserrées vous permettent de gagner 20 à 30 secondes en T2 sans vous asseoir.",
  },
  {
    id: 67, objectiveIds: [1], category: 'Transitions',
    title: 'Visitez la zone de transition avant le départ',
    body: "Mémorisez le chemin sortie eau → vélo et vélo → sortie vélo. Le stress du jour J brouille ces repères pourtant simples.",
  },
  // ── NUTRITION ─────────────────────────────────────────────────────────────
  {
    id: 68, objectiveIds: [1], category: 'Nutrition',
    title: 'Hydratez-vous tout au long de la journée',
    body: "Ne buvez pas uniquement pendant l'effort. Une bonne hydratation quotidienne améliore les performances et la récupération.",
  },
  {
    id: 69, objectiveIds: [1], category: 'Nutrition',
    title: 'Exploitez la fenêtre métabolique',
    body: "Dans les 30 minutes après un effort intense, consommez protéines + glucides (yaourt + banane, smoothie). Cela accélère la récupération musculaire.",
  },
  {
    id: 70, objectiveIds: [1], category: 'Nutrition',
    title: 'Testez tous vos produits à l'entraînement',
    body: "Gels, barres, boissons isotoniques — testez chaque produit plusieurs fois avant la course. Votre système digestif doit s'y habituer.",
  },
  {
    id: 71, objectiveIds: [1], category: 'Nutrition',
    title: 'Chargez en glucides 48 h avant',
    body: "Augmentez légèrement les féculents (pâtes, riz, pain) les deux jours précédant la course pour maximiser vos réserves de glycogène.",
  },
  {
    id: 72, objectiveIds: [1], category: 'Nutrition',
    title: 'Respectez votre petit-déjeuner de course',
    body: "Votre repas du matin (2-3 h avant le départ) doit avoir été répété à l'entraînement. Ne testez rien de nouveau le jour J.",
  },
  {
    id: 73, objectiveIds: [1], category: 'Nutrition',
    title: 'Gérez vos électrolytes par forte chaleur',
    body: "La perte de sodium par la transpiration est importante. Des pastilles de sel ou une boisson riche en électrolytes sont indispensables par temps chaud.",
  },
  {
    id: 74, objectiveIds: [1], category: 'Nutrition',
    title: 'Évitez les fibres la veille',
    body: "Légumineuses, choux, aliments très fibreux peuvent provoquer des inconforts digestifs pendant la course. Mangez ce que vous digérez facilement.",
  },
  {
    id: 75, objectiveIds: [1], category: 'Nutrition',
    title: 'Connaissez les produits des ravitaillements',
    body: "Renseignez-vous sur les marques de gels et boissons disponibles sur le parcours. Si vous ne les connaissez pas, apportez les vôtres sur le vélo.",
  },
  {
    id: 76, objectiveIds: [1], category: 'Nutrition',
    title: 'Dînez simple la veille',
    body: "Pâtes, riz, poulet — un repas digeste et connu. Pas de sauce grasse, pas de crudités en excès, pas de nouveauté.",
  },
  {
    id: 77, objectiveIds: [1], category: 'Nutrition',
    title: 'Intégrez des oméga-3 régulièrement',
    body: "Poissons gras, noix, huile de colza réduisent l'inflammation et favorisent la récupération musculaire sur la durée.",
  },
  {
    id: 78, objectiveIds: [1], category: 'Nutrition',
    title: 'Adaptez vos calories à votre volume',
    body: "Pendant les semaines de gros volume, mangez davantage. En semaine de récupération, réduisez légèrement pour éviter les stocks inutiles.",
  },
  {
    id: 79, objectiveIds: [1], category: 'Nutrition',
    title: 'Supprimez l'alcool la semaine de course',
    body: "L'alcool perturbe le sommeil, déshydrate et ralentit la récupération. Évitez toute consommation dans les 5 jours précédant la compétition.",
  },
  // ── RÉCUPÉRATION ──────────────────────────────────────────────────────────
  {
    id: 80, objectiveIds: [1], category: 'Récupération',
    title: 'Dormez 7 à 9 heures',
    body: "C'est pendant le sommeil que les muscles se reconstruisent et que le système nerveux récupère. Aucun complément ne remplace un sommeil de qualité.",
  },
  {
    id: 81, objectiveIds: [1], category: 'Récupération',
    title: 'Respectez les jours de repos',
    body: "Un jour de repos complet par semaine est une nécessité physiologique. Sans repos, l'adaptation à l'entraînement ne se produit pas.",
  },
  {
    id: 82, objectiveIds: [1], category: 'Récupération',
    title: 'Alternez dur et facile',
    body: "Une séance intensive doit toujours être suivie d'une séance légère ou d'un repos. Enchaîner deux séances dures est la principale cause de blessures.",
  },
  {
    id: 83, objectiveIds: [1], category: 'Récupération',
    title: 'Pratiquez la récupération active',
    body: "Après une compétition ou une semaine chargée, une séance très légère (natation douce, vélo facile) accélère l'élimination des déchets métaboliques.",
  },
  {
    id: 84, objectiveIds: [1], category: 'Récupération',
    title: 'Étirez-vous après l'effort',
    body: "10 minutes d'étirements doux après chaque séance maintiennent votre souplesse. Insistez sur quadriceps, mollets et ischio-jambiers.",
  },
  {
    id: 85, objectiveIds: [1], category: 'Récupération',
    title: 'Reconnaissez le surentraînement',
    body: "Fatigue persistante, baisse de performances, irritabilité, insomnies — si vous cumulez ces signes, prenez 3 à 5 jours de repos complet.",
  },
  {
    id: 86, objectiveIds: [1], category: 'Récupération',
    title: 'Planifiez une semaine allégée toutes les 3-4 semaines',
    body: "Réduire le volume de 30 à 40% permet à votre corps de super-compenser et de ressortir plus fort la semaine suivante.",
  },
  {
    id: 87, objectiveIds: [1], category: 'Récupération',
    title: 'Gérez votre semaine de course',
    body: "Réduisez votre volume de 50% la semaine de compétition. Votre forme est déjà construite — l'objectif est d'arriver reposé.",
  },
  {
    id: 88, objectiveIds: [1], category: 'Récupération',
    title: 'Consultez dès les premières douleurs articulaires',
    body: "Genou du coureur, tendon d'Achille, bandelette iliotibiale — ces blessures de surutilisation touchent fréquemment les triathlètes. Attendre aggrave systématiquement.",
  },
  {
    id: 89, objectiveIds: [1], category: 'Récupération',
    title: 'Récupérez intelligemment après la course',
    body: "Les 48 premières heures post-compétition, privilégiez repos, hydratation et protéines. Reprenez un entraînement léger après 5 à 7 jours.",
  },
  // ── PRÉPARATION MENTALE ───────────────────────────────────────────────────
  {
    id: 90, objectiveIds: [1], category: 'Mental',
    title: 'Visualisez votre course en détail',
    body: "Fermez les yeux et imaginez chaque étape, de la mise à l'eau à la ligne d'arrivée. Cette technique améliore la confiance et réduit le stress pré-compétitif.",
  },
  {
    id: 91, objectiveIds: [1], category: 'Mental',
    title: 'Découpez la course en blocs',
    body: "Ne pensez pas à la distance totale. Concentrez-vous sur le prochain objectif immédiat — la prochaine bouée, le prochain kilomètre.",
  },
  {
    id: 92, objectiveIds: [1], category: 'Mental',
    title: 'Adoptez un mantra personnel',
    body: "Choisissez une phrase courte et positive (\"Je suis capable\", \"Un pas à la fois\"). Un mantra ancré s'active automatiquement dans les moments difficiles.",
  },
  {
    id: 93, objectiveIds: [1], category: 'Mental',
    title: 'Acceptez les mauvaises séances',
    body: "Elles font partie du processus. Elles testent votre résilience et vous apprennent autant sur votre corps que les bonnes journées.",
  },
  {
    id: 94, objectiveIds: [1], category: 'Mental',
    title: 'Analysez sans vous juger',
    body: "Après chaque entraînement, faites un bilan factuel. Ce qui n'a pas fonctionné est une information précieuse, pas un échec personnel.",
  },
  {
    id: 95, objectiveIds: [1], category: 'Mental',
    title: 'Rejoignez un groupe de triathlètes',
    body: "Un club ou un groupe d'entraînement vous motivera dans les moments de doute et vous apportera des conseils issus de l'expérience des autres.",
  },
  {
    id: 96, objectiveIds: [1], category: 'Mental',
    title: 'Gérez votre stress la veille',
    body: "Un peu de stress est positif. La veille, évitez de sur-analyser et faites quelque chose qui vous détend : film, lecture, musique.",
  },
  {
    id: 97, objectiveIds: [1], category: 'Mental',
    title: 'Fixez des objectifs par discipline',
    body: "Pas seulement le chrono final — fixez des objectifs intermédiaires (sortir dans le premier tiers, maintenir une moyenne vélo cible) pour mesurer votre progression.",
  },
  // ── LOGISTIQUE ────────────────────────────────────────────────────────────
  {
    id: 98, objectiveIds: [1], category: 'Logistique',
    title: 'Inscrivez-vous tôt',
    body: "Les grandes épreuves affichent complet des mois à l'avance. Planifiez votre saison en début d'année et inscrivez-vous à l'ouverture.",
  },
  {
    id: 99, objectiveIds: [1], category: 'Logistique',
    title: 'Lisez le guide du participant entièrement',
    body: "Règles spécifiques, horaires, règlement de la transition, pénalités — chaque course a ses particularités. Une lecture attentive évite les mauvaises surprises.",
  },
  {
    id: 100, objectiveIds: [1], category: 'Logistique',
    title: 'Préparez votre sac sur checklist',
    body: "Listez chaque équipement et cochez-le en préparant votre sac. Sous le stress du matin de course, les oublis sont fréquents.",
  },
  {
    id: 101, objectiveIds: [1], category: 'Logistique',
    title: 'Arrivez 90 minutes avant votre départ',
    body: "Installer votre transition sereinement, repérer les accès et vous échauffer demandent du temps. Ne sous-estimez pas la logistique du matin de course.",
  },
  {
    id: 102, objectiveIds: [1], category: 'Logistique',
    title: 'Planifiez votre saison autour d'une course cible',
    body: "Choisissez une ou deux épreuves principales et structurez votre entraînement autour de ces échéances. Les autres compétitions servent de répétitions.",
  },
  {
    id: 103, objectiveIds: [1], category: 'Logistique',
    title: 'Reconnaissez le parcours avant la course',
    body: "Si possible, nagez dans le plan d'eau, roulez le circuit vélo et courez le circuit pied avant le jour J. La familiarité avec le terrain est un avantage mental considérable.",
  },
  {
    id: 104, objectiveIds: [1], category: 'Logistique',
    title: 'Planifiez votre récupération post-saison',
    body: "Après votre dernière course, accordez-vous 3 à 4 semaines d'activités plaisir sans contrainte de performance avant de reprendre un entraînement structuré.",
  },
]
