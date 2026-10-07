# site-test-ticatag

Site vitrine de test pour Ticatag — React + Vite + TypeScript + Tailwind.

```bash
npm install
npm run dev      # développement
npm run build    # typecheck + build de production (dist/)
npm run preview  # servir le build
```

## Pages
- `/` Accueil : hero canvas BLE, grille produits (tilt 3D), radar live filtrable, cas d'usage (scroll horizontal GSAP), calculateur de ROI, marquee références
- `/products` Filtres techno/secteur, vue éclatée 3D (OM1S / TG230, hotspots), matrice comparative sticky
- `/solutions` Onglets par métier + parcours problème → solution → résultat
- `/platform` Dashboard simulé : carte live, tracé de zones de geofencing, alertes temps réel

## i18n
Textes dans `src/i18n/fr.ts` (source) et `src/i18n/en.ts` (typé sur le FR). Bouton FR/EN dans la navbar.

## À valider avant mise en ligne
Contenu de démonstration : specs produits, références clients, badges ISO, chiffres du ROI
(hypothèses dans `RoiCalculator.tsx`), e-mail du CTA (`CtaBand.tsx`) et URL fictive `cloud.ticatag.demo`.
