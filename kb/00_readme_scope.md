# NordikAventure – Knowledge Base

## Portée de la base de connaissances

Ce dossier contient les documents utilisés par NordikBot, l'assistant IA de NordikAventure.

### Fichiers inclus

| Fichier | Contenu | Langue |
|---|---|---|
| 01_admin_arrival_fr/en | Démarches administratives à l'arrivée au Québec | FR / EN |
| 02_university_basics_fr/en | Système universitaire québécois (crédits, évaluations) | FR / EN |
| 03_transport_fr/en | Transport en commun au Québec | FR / EN |
| 04_study_success_fr/en | Réussite académique, méthodes, ressources | FR / EN |
| 05_glossary_fr/en | Glossaire des termes universitaires québécois | FR / EN |
| 06_uqar_levis_fr/en | Informations spécifiques à l'UQAR – Campus Lévis | FR / EN |

### Règles du chatbot (NordikBot)

- Répond **uniquement** à partir de ces documents.
- Si l'info n'est pas présente, il le dit clairement et indique où vérifier.
- Répond dans la langue de la question (FR ou EN).
- Cite les ressources quand c'est pertinent.

### Comment ajouter une nouvelle université

1. Créer `XX_nomville_fr.md` et `XX_nomville_en.md` dans ce dossier.
2. Ajouter les infos : registrariat, services, logement, transport local.
3. Upload le fichier dans le vector store OpenAI (via l'API ou l'interface OpenAI Platform).
4. Répéter pour toutes les langues souhaitées.
