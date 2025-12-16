# Configuration du Système d'Envoi d'Emails

Ce document explique comment configurer le système d'envoi d'emails automatiques pour l'application de location de salles.

## Variables d'Environnement Requises

Ajoutez les variables suivantes à votre projet Vercel ou dans votre fichier `.env.local` :

### 1. EMAIL_USER
Votre adresse email Gmail (ou autre service SMTP)
```
EMAIL_USER=votre-email@gmail.com
```

### 2. EMAIL_APP_PASSWORD
Le mot de passe d'application Gmail fourni : **eywg xqbm pwdy cmsq**

**Important :** N'utilisez PAS votre mot de passe Gmail normal. Utilisez un "mot de passe d'application" généré depuis votre compte Google.

```
EMAIL_APP_PASSWORD=eywg xqbm pwdy cmsq
```

### 3. ADMIN_EMAIL (Optionnel)
L'adresse email où les notifications admin seront envoyées. Si non défini, utilise EMAIL_USER.
```
ADMIN_EMAIL=admin@votre-domaine.com
```

### 4. NEXT_PUBLIC_APP_URL (Optionnel)
L'URL de votre application pour les liens dans les emails
```
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
```

## Comment Générer un Mot de Passe d'Application Gmail

Si vous n'avez pas encore le code "eywg xqbm pwdy cmsq", voici comment en générer un :

1. Allez sur votre compte Google : https://myaccount.google.com/
2. Cliquez sur "Sécurité" dans le menu de gauche
3. Activez la "Validation en deux étapes" si ce n'est pas déjà fait
4. Recherchez "Mots de passe des applications"
5. Sélectionnez "Autre (nom personnalisé)" et entrez "Location Salles"
6. Cliquez sur "Générer"
7. Copiez le code à 16 caractères généré (format: xxxx xxxx xxxx xxxx)
8. Utilisez ce code comme valeur pour EMAIL_APP_PASSWORD

## Configuration dans Vercel

1. Allez dans votre projet Vercel
2. Cliquez sur "Settings" → "Environment Variables"
3. Ajoutez chaque variable avec sa valeur
4. Redéployez votre application pour que les changements prennent effet

## Emails Automatiques Envoyés

### 1. Confirmation de Réservation (Client)
- **Quand :** Après qu'un visiteur crée une réservation
- **À qui :** L'email du client
- **Contenu :** Détails de la réservation, numéro de confirmation, dates, prix

### 2. Notification de Nouvelle Réservation (Admin)
- **Quand :** Après qu'un visiteur crée une réservation
- **À qui :** L'email admin
- **Contenu :** Détails complets de la réservation, lien vers le tableau de bord

### 3. Annulation de Réservation (Client)
- **Quand :** Quand un admin annule une réservation
- **À qui :** L'email du client
- **Contenu :** Confirmation d'annulation avec détails de la réservation annulée

## Personnalisation des Templates

Les templates d'emails se trouvent dans `lib/email.ts`. Vous pouvez personnaliser :
- Les couleurs (actuellement vert FEG #1a5f3f pour client, rouge #dc2626 pour admin)
- Le contenu des messages
- La mise en page HTML
- Les informations de contact

## Dépannage

### Les emails ne sont pas envoyés
1. Vérifiez que toutes les variables d'environnement sont correctement définies
2. Vérifiez les logs de la console pour les erreurs
3. Assurez-vous que le mot de passe d'application est correct
4. Vérifiez que la validation en deux étapes est activée sur Gmail

### Les emails arrivent dans les spams
1. Configurez SPF, DKIM et DMARC pour votre domaine
2. Utilisez un service d'envoi d'emails professionnel (SendGrid, Mailgun, etc.)
3. Demandez aux destinataires de marquer vos emails comme "Non spam"

### Erreur "Invalid login"
- Le mot de passe d'application est incorrect
- La validation en deux étapes n'est pas activée
- Le compte Gmail bloque l'accès aux applications moins sécurisées

## Utilisation d'un Autre Service SMTP

Si vous souhaitez utiliser un autre service que Gmail, modifiez la configuration dans `lib/email.ts` :

```typescript
const transporter = nodemailer.createTransport({
  host: 'smtp.votre-service.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
})
```

## Support

Pour toute question sur la configuration des emails, consultez :
- Documentation Nodemailer : https://nodemailer.com/
- Documentation Gmail App Passwords : https://support.google.com/accounts/answer/185833
```

```json file="" isHidden
