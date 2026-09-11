# Expérience principale — Shippingbo

**Product Owner / Product Manager Junior**
Shippingbo · SaaS B2B logistique (OMS, WMS, TMS) · Stage → CDD · Toulouse
Juillet 2025 → Avril 2026 (10 mois)

## Contexte
SaaS B2B logistique en environnement Agile/Scrum. Maîtrise du cycle produit complet : conception, delivery, recette, mise en production.

## Missions générales
- Pilotage de livraison de features de bout en bout : conception avec équipes métier jusqu'à mise en production, respect délais et qualité (Definition of Done).
- Gestion et priorisation du backlog produit : structuration Epics, User Stories, tâches techniques ; mise à jour continue selon arbitrages business et retours terrain.
- Recette fonctionnelle en autonomie : validation des développements, identification anomalies, coordination corrections avant chaque mise en production.
- Animation de tous les rituels Scrum : sprint planning, backlog refinement, daily, sprint review, retrospective.
- Coordination des dépendances entre équipes dev internes et prestataires externes ; anticipation des risques, gestion des impédiments pour maintenir la vélocité.
- Support utilisateurs : analyse des remontées incidents, traitement des demandes spécifiques, boucle de feedback quotidienne avec le Head of Customer Support.
- Contribution à la roadmap : priorisation orientée impact métier (MoSCoW, valeur/effort), challenge technique des équipes dev sur performance et fiabilité.

## Contribution clé — Pilotage MVP IA (bundle de 4 features)

Pilotage seul, en tant que PM end-to-end, d'un bundle de 4 features IA. Itérations quasi-quotidiennes (prompt tuning, MCP, API routing), QA assuré en autonomie.

### 1. Agent IA conversationnel — capable d'agir, pas seulement de répondre
La contribution la plus importante du bundle. Agent connecté à une base de données vectorielle contenant toutes les informations du compte client ainsi que toute la documentation du logiciel SaaS (architecture RAG). Mais surtout : ce n'est pas un simple agent Q&A. Il peut **exécuter directement des actions sur le compte du client** (function calling / tool use), pas juste l'informer. La base documentaire se met à jour automatiquement à chaque nouvelle documentation créée.

**Résultat mesuré :** -30% de tickets support Tier 1 dès la beta. Mesure faite via la moyenne mensuelle de tickets HubSpot des équipes support, comparée avant/après déploiement. Baisse constatée avec un décalage de 2 mois, le temps que l'usage de l'agent se diffuse chez les clients.

### 2. Audits logistiques IA
Analyse automatisée des données client sur 4 catégories : transport, ventes, commandes, retours. Le client reçoit un rapport détaillé avec pistes d'amélioration, zones à surveiller, changements à faire.

### 3. Classification ABCD des produits
Feature "intelligente" plus qu'IA pure : un algorithme détermine quels produits tournent le plus en entrepôt, lesquels sont déplacés/pickés le plus souvent. Le client peut ensuite réorganiser la disposition physique de son entrepôt en conséquence.

### 4. Détection de commandes identiques
Objectif : réduire les allers-retours des préparateurs de commandes. Si plusieurs commandes contiennent des produits similaires/identiques, le système le détecte pour permettre une préparation groupée — gain de temps significatif (secondes à heures cumulées).
