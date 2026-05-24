# IA NordikBot RAG

## Objectif
NordikBot est l'assistant intelligent de NouveauDépart. Il accompagne les étudiants internationaux au Québec avec une priorité sur l'UQAR, puis une structure extensible vers les autres universités québécoises.

NordikBot n'est pas un modèle entraîné à partir de zéro. Il utilise une architecture RAG : Retrieval Augmented Generation.

## Fine-tuning vs RAG
Le fine-tuning modifie un modèle avec des exemples d'entraînement. C'est coûteux, difficile à maintenir et peu adapté aux informations universitaires qui changent souvent.

Le RAG garde le modèle généraliste, mais lui fournit les passages pertinents de la base de connaissances avant de répondre. C'est plus fiable pour un projet universitaire, car on peut mettre à jour les fichiers Markdown puis relancer l'indexation.

## Architecture
1. Les documents Markdown sont stockés dans `/kb`.
2. La commande `python manage.py ingest_kb` lit les fichiers.
3. Chaque fichier est découpé en morceaux par sections Markdown.
4. Les morceaux reçoivent des métadonnées : université, campus, catégorie, source officielle.
5. Chaque morceau est vectorisé avec un index local léger basé sur le hachage de mots.
6. Les vecteurs sont stockés dans SQLite via les modèles `KnowledgeDocument` et `KnowledgeChunk`.
7. L'API `/api/assistant/chat/` récupère les meilleurs passages.
8. Gemini rédige une réponse uniquement à partir de ces passages si la confiance est suffisante.
9. Si l'information est absente ou faible, NordikBot répond prudemment et recommande une source officielle ou un mentor.

## Structure de la base
La base est organisée ainsi :

```text
kb/
  uqar/
  universites_quebec/
  general/
```

L'UQAR est volontairement plus détaillée. Les autres universités ont des fiches de base extensibles.

## Format d'un document
Chaque document doit commencer par des métadonnées :

```md
---
title: "UQAR - Registrariat"
description: "Attestations et relevés de notes."
category: "registrariat"
university: "UQAR"
campus: "Lévis"
language: "fr"
updated_at: "2026-05-21"
source_url: "https://www.uqar.ca/..."
keywords: "preuve d'inscription, relevé de notes"
---

# Titre

## Section
Contenu fiable et sourcé.
```

## Ajouter une université
1. Créer un fichier dans `kb/universites_quebec/`.
2. Ajouter des fichiers plus détaillés si nécessaire, par exemple `kb/ulaval/registrariat.md`.
3. Remplir `university`, `category`, `source_url` et `keywords`.
4. Relancer l'indexation.

## Indexer
Depuis `backend/` :

```bash
python manage.py migrate
python manage.py ingest_kb --clear-missing
```

## Tester
Depuis `backend/` :

```bash
python manage.py evaluate_nordikbot
```

Le rapport est généré dans :

```text
backend/assistant/evaluation_report.json
```

## API
Endpoint principal :

```http
POST /api/assistant/chat/
```

Entrée :

```json
{
  "message": "Comment obtenir une preuve d'inscription à l'UQAR ?",
  "university": "UQAR",
  "campus": "Lévis",
  "language": "fr"
}
```

Sortie :

```json
{
  "answer": "Réponse de NordikBot",
  "sources": [
    {
      "title": "UQAR - Registrariat et dossier étudiant",
      "path": "/kb/uqar/registrariat.md",
      "section": "Preuve d'inscription"
    }
  ],
  "confidence": "élevé"
}
```

## Feedback
L'interface permet de marquer une réponse comme utile ou incomplète. Les retours sont enregistrés dans `AssistantFeedback`.

Endpoint :

```http
POST /api/assistant/feedback/
```

## Sécurité
NordikBot doit éviter d'inventer :

- il répond à partir des passages récupérés ;
- il refuse ou répond prudemment si la confiance est faible ;
- il recommande les sources officielles pour les démarches importantes ;
- il ne donne pas de conseil juridique ou d'immigration définitif.

## Améliorer la qualité
Pour améliorer NordikBot :

1. Ajouter plus de documents UQAR ciblés.
2. Ajouter des FAQ réelles des étudiants.
3. Mettre à jour les sources officielles.
4. Relancer `ingest_kb`.
5. Lire `evaluation_report.json`.
6. Utiliser les feedbacks étudiants pour repérer les réponses faibles.
