# Euro Dong

PWA de conversion euros ↔ dongs, pensée pour le mobile et compatible avec GitHub Pages.

## Développement

```bash
npm install
npm run dev
```

## Production

```bash
npm run build
npm run preview
```

Le dossier `dist/` contient la version déployable. La configuration `base: './'` rend les ressources compatibles avec un sous-chemin GitHub Pages.

## Déploiement GitHub Pages

1. Créer un dépôt et y pousser le contenu de ce dossier sur la branche `main`.
2. Dans **Settings → Pages**, choisir **GitHub Actions** comme source.
3. Le workflow `.github/workflows/deploy.yml` construit et publie automatiquement la PWA.

## Aperçu instantané

Ouvrir `preview.html` directement dans un navigateur. Ce fichier autonome reproduit le convertisseur et le coffre sans nécessiter Node.js. L’installation PWA et le cache hors ligne nécessitent la version construite servie en HTTPS.

## Sécurité et Drive

Le code du coffre est un verrou d’interface côté navigateur, pas une authentification forte. Sur un site statique public, aucun secret ne peut rester réellement confidentiel. Les permissions Google Drive restent la vraie protection des documents.

Pour rendre des documents Drive disponibles hors ligne, utilisez l’option **Disponible hors connexion** dans Google Drive. Une PWA publiée sur GitHub Pages ne peut pas télécharger silencieusement le contenu d’un dossier Drive protégé.
