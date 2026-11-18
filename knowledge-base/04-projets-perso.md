## Projets perso — vue d'ensemble (Riyan Besseghir)
Q : Quels projets perso peux-tu montrer ?
R : Les cinq plus représentatifs : Méca-Riyan (ce chatbot), Départs (agent de recherche de vols), LIO en mieux (assistant d'horaires de cars), les bots d'alertes emploi, et FOODER. Je détaille chacun séparément.

Q : Ces projets sont-ils tous en production ?
R : Non, et je le dis clairement. Méca-Riyan, LIO en mieux et mon portfolio sont en ligne. Départs et les bots d'alertes fonctionnent et sont utilisés. Le reste est au stade de prototype ou de MVP. Quand les données sont factices, je l'indique.

## Projet perso — Méca-Riyan (ce chatbot) par Riyan Besseghir
Q : Parle-moi de Méca-Riyan.
R : C'est un chatbot CV en RAG, en ligne (https://riyan-cv-chatbot.vercel.app), conçu pour répondre à la place d'un CV statique aux questions des recruteurs. Il est utilisé par sa vraie cible, avec une boucle d'amélioration : une alerte Discord est envoyée sur les questions non couvertes et un dashboard admin permet de relire les conversations. Stack : Next.js, Supabase pgvector, Gemini, Groq. Choix produit : réponses courtes (2 à 3 phrases sur une question fermée), garde-fou anti-invention, cascade de modèles pour tenir les quotas et le coût (0 € à trafic personnel).

## Projet perso — Départs (agent de recherche de vols) par Riyan Besseghir
Q : Parle-moi de Départs.
R : Un agent personnel de recherche de vols (repo : https://github.com/Deady31/Travel-Agent). J'ai benchmarké 7 sources de données (Amadeus et Kiwi fermés, Skyscanner réservé aux partenaires, scraping Ryanair écarté pour les CGU) et choisi un entonnoir : Travelpayouts en cache gratuit pour explorer, SerpApi Google Flights pour vérifier en direct. Budget de 0 € par mois, principe "zéro prix inventé" (l'IA reste hors de la boucle des chiffres), score pondéré (prix 50 %, durée 22 %, escales 17 %, horaires 11 %) et critères de succès chiffrés définis avant le build. Stack : Python, FastAPI, JavaScript, serveur MCP. Exemple réel : Toulouse vers Naples, 552 € depuis Toulouse contre 155 € en aller-retour direct depuis Barcelone. C'est mon meilleur exemple de pensée produit écrite.

## Projet perso — LIO en mieux (assistant d'horaires de cars) par Riyan Besseghir
Q : Parle-moi de LIO en mieux.
R : Un assistant IA d'horaires de cars en Haute-Garonne (https://lio-ameliore.vercel.app). Le LLM sert uniquement à comprendre l'intention, tous les horaires sont calculés en code, avec un mode dégradé sans IA si le fournisseur échoue. La recherche d'arrêt tolère les fautes et abréviations. Les horaires affichés sont théoriques et les données de démonstration sont factices (le vrai GTFS n'est pas encore branché), ce qui est indiqué clairement dans l'interface. Stack : Next.js, Tailwind, Groq. C'est un exemple d'IA fiable par construction.

## Projet perso — bots d'alertes emploi par Riyan Besseghir
Q : Parle-moi de tes bots d'alertes emploi.
R : Des bots qui surveillent les offres VIE, HelloWork, LinkedIn et WTTJ et les envoient dans Discord. J'ai écrit un PRD avant le code (périmètre V1, exclusions V2) et documenté une décision de source : abandon du scraping HTML au profit de l'API JSON du site Business France. Usage réel : 234 offres traitées. Stack : Node.js, Playwright, webhooks Discord.

## Projet perso — FOODER par Riyan Besseghir
Q : Parle-moi de FOODER.
R : Le "Tinder des restos" : on swipe pour trouver un restaurant autour de soi (Toulouse), avec des amis et un fil de photos. J'ai pensé le modèle économique : freemium (20 swipes gratuits par jour, Premium à 4,99 euros par mois) et restaurants sponsorisés côté B2B. Cible : jeunes urbains de 18 à 35 ans. C'est un prototype (PWA) : pas de paiement branché et pas encore de test utilisateur à grande échelle.

## Hackathon IA for Impact — Riyan Besseghir
Q : Raconte-moi ton hackathon.
R : Hackathon IA for Impact (La Mêlée Numérique, 9 et 10 octobre 2026), en équipe de 5, sur un défi BPCE Solutions informatiques. J'avais le rôle de PM et de pitcheur : j'ai défini le MVP et l'ai prototypé avec Claude Code (un assistant IA conversationnel texte et voix qui exécute des actions), l'équipe a fait le RAG et les finitions. Nous n'avons pas eu de podium et la démo live a eu un bug de dictée vocale. J'en retiens qu'il faut sécuriser une démo live avec un plan B, et que nous avons livré un MVP en 30 heures.

## Autres projets perso de Riyan Besseghir
Q : Quels autres projets as-tu ?
R : LifeOS (dashboard de vie avec coach IA, prototype sur données factices), AI News Agent (newsletter de veille IA), Dernière Note (roguelike jazzy sous Godot, prototype jouable), la traduction française de One Piece Gigant Battle 2 sur Nintendo DS (rétro-ingénierie, 9 134 textes et 1 778 images, patch xdelta), Overwatch Nexus (conseil de picks en partie classée, https://github.com/Deady31/Overwatch-Nexus), plusieurs versions de mon portfolio, et un case study Spotify Social. Le case study Spotify est un exercice hypothétique : les chiffres sont des hypothèses, pas des résultats. J'ai aussi réalisé des maquettes de sites vitrines pour des commerces locaux et un prototype de SaaS devis/factures pour un artisan.
