# 🚀 Configuration Nodemailer - Résumé Complet

## ✅ Étapes Effectuées

### 1. **Installation des Dépendances**

- ✅ `nodemailer@^7.0.10` - déjà présent dans `package.json`
- ✅ `@types/nodemailer@^7.0.3` - déjà présent dans `package.json`

### 2. **Configuration du Fichier `.env`**

Mis à jour avec les variables requises:

```properties
# Nodemailer SMTP Configuration (Gmail)
EMAIL_USER=mikolodarselcarl@gmail.com
EMAIL_APP_PASSWORD=eywg xqbm pwdy cmsq
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
ADMIN_EMAIL=mikolodarselcarl@gmail.com
```

### 3. **Mise à Jour de `lib/email.tsx`**

Configuration Nodemailer corrigée:

```typescript
transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // TLS (587)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// Vérification automatique de la connexion
transporter.verify((error: any, success: boolean) => {
  if (error) {
    console.error("Erreur de vérification SMTP:", error);
  } else {
    console.log("Serveur SMTP prêt à envoyer des emails");
  }
});
```

### 4. **Création d'un Utilitaire de Test**

Fichier `test-email.mjs` pour tester la configuration:

```bash
node test-email.mjs
```

## 📋 Configuration SMTP

| Variable           | Valeur                     | Description                      |
| ------------------ | -------------------------- | -------------------------------- |
| SMTP_HOST          | smtp.gmail.com             | Serveur SMTP Gmail               |
| SMTP_PORT          | 587                        | Port TLS                         |
| EMAIL_USER         | mikolodarselcarl@gmail.com | Adresse email d'envoi            |
| EMAIL_APP_PASSWORD | eywg xqbm pwdy cmsq        | Mot de passe d'application Gmail |
| ADMIN_EMAIL        | mikolodarselcarl@gmail.com | Adresse email admin              |

## 🧪 Comment Tester

### Option 1: Utiliser l'Utilitaire de Test

```bash
pnpm install  # Assurez-vous que les dépendances sont installées
node test-email.mjs
```

Cet utilitaire va:

- ✅ Vérifier les variables d'environnement
- ✅ Tester la connexion SMTP
- ✅ Envoyer un email de test
- ✅ Afficher le status et les erreurs

### Option 2: Tester dans l'Application

1. Démarrez le serveur: `pnpm dev`
2. Créez une réservation via le formulaire de booking
3. Vérifiez les logs du serveur pour les messages de succès/erreur
4. Vérifiez que l'email est reçu (ou dans les spams)

## 📧 Emails Automatiquement Envoyés

### 1. Confirmation Client

- **Déclencheur**: Nouvelle réservation créée
- **Destinataire**: Email du client
- **Contenu**:
  - Numéro de réservation
  - Détails de la salle
  - Dates/heures
  - Prix total
  - Instructions importantes

### 2. Notification Admin

- **Déclencheur**: Nouvelle réservation créée
- **Destinataire**: Email admin (`ADMIN_EMAIL`)
- **Contenu**:
  - Détails complets de la réservation
  - Informations client (nom, email, téléphone)
  - Montant total
  - Lien vers le tableau de bord admin

### 3. Annulation

- **Déclencheur**: Admin annule une réservation
- **Destinataire**: Email du client
- **Contenu**:
  - Confirmation d'annulation
  - Détails de la réservation annulée

## 🔐 Sécurité

⚠️ **IMPORTANT**:

- Le mot de passe `EMAIL_APP_PASSWORD` doit être un **mot de passe d'application Gmail** (généré depuis https://myaccount.google.com/apppasswords)
- N'utilisez PAS votre mot de passe Gmail normal
- L'authentification à deux facteurs DOIT être activée sur votre compte Gmail

## ⚠️ Dépannage

### Erreur: "Module not found: Can't resolve 'nodemailer'"

**Solution**:

```bash
pnpm install
```

Les dépendances sont déjà dans `package.json`, cette erreur survient lors du premier démarrage.

### Erreur: "Invalid login: 535-5.7.8"

**Cause**: Mot de passe d'application incorrect ou authentification 2FA non activée
**Solution**:

1. Allez sur https://myaccount.google.com/apppasswords
2. Régénérez un mot de passe d'application
3. Mettez à jour `EMAIL_APP_PASSWORD` dans `.env`

### Erreur: "SMTP connection timeout"

**Cause**: Mauvaise configuration SMTP ou problème de connectivité
**Solution**:

- Vérifiez: `SMTP_HOST=smtp.gmail.com` et `SMTP_PORT=587`
- Testez avec: `node test-email.mjs`
- Vérifiez votre connexion réseau

### Les emails arrivent dans les spams

**Cause**: Configuration d'authentification d'email insuffisante
**Solution**:

- Configurez SPF, DKIM, DMARC pour votre domaine
- Demandez à Gmail de reconnaître l'expéditeur
- Utilisez un service d'envoi professionnel (SendGrid, Mailgun)

## 📚 Fichiers Modifiés

| Fichier          | Modifications                                                                      |
| ---------------- | ---------------------------------------------------------------------------------- |
| `.env`           | Ajouté variables SMTP_HOST, SMTP_PORT, EMAIL_USER, EMAIL_APP_PASSWORD, ADMIN_EMAIL |
| `lib/email.tsx`  | Mis à jour la configuration Nodemailer pour utiliser SMTP direct avec TLS          |
| `EMAIL_SETUP.md` | Mis à jour avec nouvelle configuration SMTP et guide de test                       |
| `test-email.mjs` | 🆕 Créé utilitaire de test pour valider la configuration                           |

## 🚀 Déploiement (Vercel)

1. Allez sur Vercel > Settings > Environment Variables
2. Ajoutez chaque variable:
   - EMAIL_USER
   - EMAIL_APP_PASSWORD
   - SMTP_HOST
   - SMTP_PORT
   - ADMIN_EMAIL
3. Redéployez votre application

## ✨ Prochaines Étapes

1. **Installer les dépendances** (si pas déjà fait):

   ```bash
   pnpm install
   ```

2. **Tester la configuration**:

   ```bash
   node test-email.mjs
   ```

3. **Démarrer l'application**:

   ```bash
   pnpm dev
   ```

4. **Vérifier les logs** lors d'une nouvelle réservation

## 📞 Support

- 📖 [Documentation Nodemailer](https://nodemailer.com/)
- 🔐 [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- 📧 [Configuration SMTP Gmail](https://support.google.com/mail/answer/185833)

---

**Statut**: ✅ Configuration complète et prête à l'emploi
