import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Building2,
  Calendar,
  Upload,
  Eye,
  Edit,
  Trash2,
  Lock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
} from "lucide-react"

export default function AdminGuidePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Guide d'Utilisation - Administration</h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            Bienvenue dans le guide d'utilisation de la plateforme de gestion des salles. Ce guide vous aidera à
            maîtriser toutes les fonctionnalités de l'interface d'administration et à optimiser la gestion de vos
            espaces de location.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-3">
            <div className="flex items-start gap-3">
              <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-slate-700 leading-relaxed">
                <p className="font-semibold text-blue-900">À propos de cette plateforme</p>
                <p>
                  Cette plateforme de gestion des salles a été conçue pour simplifier et automatiser la location
                  d'espaces professionnels. Elle permet aux visiteurs de consulter les salles disponibles, de vérifier
                  les disponibilités en temps réel via un calendrier interactif, et de soumettre des demandes de
                  réservation. En tant qu'administrateur, vous avez un contrôle total sur l'inventaire des salles, la
                  gestion des réservations, et la visibilité de vos espaces.
                </p>
                <p>
                  L'interface a été pensée pour être intuitive et efficace, vous permettant de gérer votre activité de
                  location en quelques clics. Toutes les modifications que vous effectuez sont immédiatement visibles
                  par les visiteurs, garantissant une information toujours à jour et une expérience utilisateur
                  optimale.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Vue d'ensemble du système */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-200">
              <CardTitle className="text-2xl">Vue d'Ensemble du Système</CardTitle>
              <CardDescription className="text-base mt-1">
                Comprendre le fonctionnement global de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                La plateforme fonctionne selon un flux simple mais puissant qui connecte vos salles aux clients
                potentiels. Voici comment les différents éléments interagissent :
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">Création et gestion des salles</p>
                    <p className="text-sm">
                      Vous créez des fiches détaillées pour chaque salle avec photos, descriptions, capacité et tarifs.
                      Ces informations sont immédiatement publiées sur la page d'accueil visible par tous les visiteurs.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">Consultation par les visiteurs</p>
                    <p className="text-sm">
                      Les visiteurs parcourent le catalogue de salles, consultent les détails, vérifient les
                      disponibilités sur le calendrier interactif, et calculent automatiquement le coût total de leur
                      location selon les dates choisies.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">Réservations et gestion</p>
                    <p className="text-sm">
                      Les réservations (qu'elles proviennent des visiteurs ou que vous les créiez vous-même) sont
                      enregistrées dans le système. Elles bloquent automatiquement les dates concernées dans le
                      calendrier pour éviter les doubles réservations. Vous pouvez consulter, gérer et annuler les
                      réservations à tout moment.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">4</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">Synchronisation en temps réel</p>
                    <p className="text-sm">
                      Toutes les modifications (ajout de salle, changement de prix, mise en réserve, nouvelle
                      réservation) sont instantanément reflétées sur l'interface publique. Le calendrier se met à jour
                      automatiquement pour afficher les disponibilités actuelles.
                    </p>
                  </div>
                </div>
              </div>
              <p className="pt-2">
                Cette architecture garantit que vos clients ont toujours accès aux informations les plus récentes,
                réduisant les risques de confusion et améliorant l'efficacité de votre service de location.
              </p>
            </CardContent>
          </Card>

          {/* Gestion des Salles */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Gestion des Salles</CardTitle>
                  <CardDescription className="text-base mt-1">
                    Créer, modifier et gérer vos salles de location
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="text-muted-foreground leading-relaxed space-y-3">
                <p>
                  La gestion des salles est au cœur de votre activité sur cette plateforme. Chaque salle que vous créez
                  devient une vitrine pour attirer des clients potentiels. Il est donc essentiel de fournir des
                  informations complètes, précises et attractives pour maximiser vos chances de location.
                </p>
                <p>
                  Une fiche de salle bien renseignée doit permettre au visiteur de se projeter dans l'espace et de
                  comprendre immédiatement si la salle correspond à ses besoins. Pensez à inclure tous les détails
                  pertinents : équipements audiovisuels, connexion internet, climatisation, accessibilité, services
                  inclus (café, eau, etc.), et toute autre information qui pourrait influencer la décision de location.
                </p>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Ajouter une nouvelle salle
                </h3>
                <div className="space-y-3 ml-7 text-muted-foreground leading-relaxed">
                  <p>
                    L'ajout d'une nouvelle salle est un processus simple mais important. Prenez le temps de bien remplir
                    chaque champ pour créer une présentation professionnelle et complète de votre espace.
                  </p>
                </div>
                <ol className="space-y-3 ml-7 text-muted-foreground leading-relaxed mt-4">
                  <li className="pl-2">
                    <strong className="text-foreground">1. Accéder au formulaire :</strong> Depuis le tableau de bord
                    principal, cliquez sur le bouton "Ajouter une salle". Vous serez redirigé vers un formulaire de
                    création.
                  </li>
                  <li className="pl-2">
                    <strong className="text-foreground">2. Nom de la salle :</strong> Choisissez un nom clair et
                    descriptif (ex: "Salle de Conférence Exécutive", "Espace Formation 50 personnes"). Le nom doit être
                    unique et facilement identifiable pour vous et vos clients.
                  </li>
                  <li className="pl-2">
                    <strong className="text-foreground">3. Description détaillée :</strong> Rédigez une description
                    complète qui met en valeur les atouts de la salle. Mentionnez :
                    <ul className="list-disc ml-6 mt-2 space-y-1 text-sm">
                      <li>Les équipements disponibles (projecteur, écran, système audio, tableau blanc, etc.)</li>
                      <li>La configuration possible (théâtre, classe, U, banquet, cocktail)</li>
                      <li>Les services inclus (Wi-Fi, climatisation, café, eau, parking)</li>
                      <li>L'ambiance et le style de la salle (moderne, classique, lumineuse, etc.)</li>
                      <li>Les types d'événements recommandés (réunions, formations, séminaires, etc.)</li>
                    </ul>
                  </li>
                  <li className="pl-2">
                    <strong className="text-foreground">4. Capacité maximale :</strong> Indiquez le nombre maximum de
                    personnes que la salle peut accueillir confortablement. Soyez réaliste pour éviter les déceptions et
                    garantir le confort de vos clients.
                  </li>
                  <li className="pl-2">
                    <strong className="text-foreground">5. Prix par jour :</strong> Définissez votre tarif journalier en
                    FCFA. Le système accepte des montants jusqu'à 99,999,999 FCFA. Assurez-vous que votre prix est
                    compétitif tout en reflétant la qualité et les services offerts. Le prix sera automatiquement
                    multiplié par le nombre de jours lors des réservations.
                  </li>
                  <li className="pl-2">
                    <strong className="text-foreground">6. Image de la salle :</strong> Une image de qualité est
                    cruciale pour attirer l'attention. Voir la section dédiée ci-dessous pour plus de détails sur le
                    téléchargement d'images.
                  </li>
                  <li className="pl-2">
                    <strong className="text-foreground">7. Statut de disponibilité :</strong> Cochez "Disponible" si la
                    salle est prête à être louée immédiatement. Si vous préparez encore la salle ou si elle nécessite
                    des travaux, laissez cette option décochée jusqu'à ce qu'elle soit opérationnelle.
                  </li>
                  <li className="pl-2">
                    <strong className="text-foreground">8. Validation :</strong> Cliquez sur "Créer la salle" pour
                    enregistrer. La salle apparaîtra immédiatement sur la page d'accueil publique si elle est marquée
                    comme disponible.
                  </li>
                </ol>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Télécharger et gérer les images
                </h3>
                <div className="space-y-4 ml-7 text-muted-foreground leading-relaxed">
                  <p>
                    Les images sont l'élément visuel le plus important de votre fiche de salle. Une photo
                    professionnelle et attrayante peut faire la différence entre une réservation et un visiteur qui
                    passe son chemin. Investissez du temps dans la sélection ou la prise de photos de qualité.
                  </p>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                    <p className="font-semibold text-foreground">Conseils pour des photos réussies :</p>
                    <ul className="list-disc ml-6 space-y-2 text-sm">
                      <li>Utilisez un bon éclairage naturel ou un éclairage professionnel</li>
                      <li>Photographiez la salle sous plusieurs angles pour montrer l'espace dans son ensemble</li>
                      <li>Assurez-vous que la salle est propre, rangée et bien présentée</li>
                      <li>Mettez en valeur les équipements et les points forts de la salle</li>
                      <li>Utilisez une résolution suffisante (minimum 1200x800 pixels recommandé)</li>
                      <li>Évitez les photos floues, sombres ou mal cadrées</li>
                    </ul>
                  </div>
                  <p className="font-semibold text-foreground mt-4">Deux méthodes de téléchargement :</p>
                  <div className="space-y-3">
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                      <p className="font-semibold text-foreground mb-2">
                        Option 1 : Téléchargement direct depuis votre ordinateur
                      </p>
                      <p className="text-sm mb-2">
                        Cliquez sur le bouton "Choisir un fichier" dans le formulaire de salle. Sélectionnez une image
                        depuis votre ordinateur. Le système accepte les formats JPG, PNG et WebP avec une taille
                        maximale de 5 MB par fichier.
                      </p>
                      <p className="text-sm">
                        Une fois le fichier sélectionné, un aperçu s'affiche immédiatement pour vous permettre de
                        vérifier que l'image est correcte avant de soumettre le formulaire. Le fichier sera
                        automatiquement téléchargé vers un stockage sécurisé et optimisé lors de la création de la
                        salle.
                      </p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                      <p className="font-semibold text-foreground mb-2">Option 2 : URL d'image externe</p>
                      <p className="text-sm mb-2">
                        Si votre image est déjà hébergée en ligne (sur Google Drive, Dropbox, ou tout autre service),
                        vous pouvez simplement coller l'URL de l'image dans le champ prévu à cet effet.
                      </p>
                      <p className="text-sm">
                        <strong>Support Google Drive :</strong> Le système détecte automatiquement les liens Google
                        Drive et les convertit en URLs d'images directes. Assurez-vous que votre fichier Google Drive
                        est configuré en "Accessible à toute personne disposant du lien" pour que l'image soit visible
                        publiquement.
                      </p>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm space-y-1">
                        <p className="font-semibold text-blue-900">Gestion automatique des fichiers</p>
                        <p>
                          Chaque image téléchargée reçoit automatiquement un nom de fichier unique pour éviter les
                          conflits. Vous n'avez pas à vous soucier de renommer vos fichiers ou de gérer les doublons. Le
                          système s'occupe de tout et garantit que chaque image est stockée de manière sécurisée et
                          accessible.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  Mettre une salle en réserve
                </h3>
                <div className="space-y-4 ml-7 text-muted-foreground leading-relaxed">
                  <p>
                    La fonction "Mettre en réserve" est un outil puissant pour gérer temporairement la disponibilité
                    d'une salle sans avoir à la supprimer complètement du système. Cette fonctionnalité est
                    particulièrement utile dans plusieurs situations courantes.
                  </p>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                    <p className="font-semibold text-foreground">Cas d'usage typiques :</p>
                    <ul className="list-disc ml-6 space-y-2 text-sm">
                      <li>
                        <strong>Maintenance et rénovations :</strong> Lorsque vous effectuez des travaux d'entretien, de
                        peinture, ou de rénovation, mettez la salle en réserve pour informer les visiteurs qu'elle est
                        temporairement indisponible.
                      </li>
                      <li>
                        <strong>Événements internes :</strong> Si vous utilisez la salle pour un événement interne de
                        votre organisation, vous pouvez la réserver pour bloquer les dates sans créer une réservation
                        client formelle.
                      </li>
                      <li>
                        <strong>Problèmes techniques :</strong> En cas de panne d'équipement (climatisation, projecteur,
                        etc.) qui nécessite une réparation, mettez la salle en réserve jusqu'à ce que le problème soit
                        résolu.
                      </li>
                      <li>
                        <strong>Préparation d'une nouvelle salle :</strong> Pour une salle nouvellement ajoutée qui
                        n'est pas encore complètement prête, vous pouvez la créer dans le système mais la mettre en
                        réserve jusqu'à ce qu'elle soit opérationnelle.
                      </li>
                    </ul>
                  </div>
                  <p className="font-semibold text-foreground mt-4">Comment mettre une salle en réserve :</p>
                  <ol className="space-y-2 mt-2">
                    <li className="pl-2">
                      <strong className="text-foreground">1.</strong> Accédez à la liste des salles depuis le tableau de
                      bord
                    </li>
                    <li className="pl-2">
                      <strong className="text-foreground">2.</strong> Cliquez sur l'icône d'édition{" "}
                      <Edit className="h-4 w-4 inline" />
                      de la salle concernée
                    </li>
                    <li className="pl-2">
                      <strong className="text-foreground">3.</strong> Dans le formulaire d'édition, cochez l'option
                      "Mettre en réserve"
                    </li>
                    <li className="pl-2">
                      <strong className="text-foreground">4.</strong> Enregistrez les modifications
                    </li>
                  </ol>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm space-y-2">
                        <p className="font-semibold text-amber-900">Important à savoir</p>
                        <p>
                          Une salle en réserve reste visible dans le catalogue public avec un badge orange "En réserve".
                          Les visiteurs peuvent voir ses informations et ses photos, mais ne peuvent pas la réserver.
                          Cela maintient la visibilité de votre offre tout en empêchant les réservations.
                        </p>
                        <p>
                          Pour rendre la salle à nouveau disponible, retournez simplement dans le formulaire d'édition
                          et décochez l'option "Mettre en réserve". La salle redeviendra immédiatement réservable.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Edit className="h-5 w-5 text-primary" />
                  Modifier une salle existante
                </h3>
                <div className="space-y-3 ml-7 text-muted-foreground leading-relaxed">
                  <p>
                    La modification d'une salle vous permet de mettre à jour n'importe quelle information : nom,
                    description, capacité, prix, image, ou statuts de disponibilité et de réserve. Il est recommandé de
                    maintenir vos fiches de salles à jour pour refléter les changements d'équipements, les ajustements
                    de prix, ou les améliorations apportées à vos espaces.
                  </p>
                  <p>
                    Pour modifier une salle, cliquez simplement sur l'icône <Edit className="h-4 w-4 inline" /> dans le
                    tableau des salles. Vous accéderez au même formulaire que lors de la création, pré-rempli avec les
                    informations actuelles. Modifiez les champs souhaités et enregistrez. Les changements sont appliqués
                    immédiatement et visibles par tous les visiteurs.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">
                        <strong className="text-blue-900">Astuce :</strong> Si vous modifiez le prix d'une salle, cela
                        n'affecte pas les réservations déjà existantes. Seules les nouvelles réservations utiliseront le
                        nouveau tarif. Cela garantit que les engagements pris avec vos clients sont respectés.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-destructive" />
                  Supprimer une salle
                </h3>
                <div className="space-y-3 ml-7 text-muted-foreground leading-relaxed">
                  <p>
                    La suppression d'une salle est une action définitive qui retire complètement la salle du système.
                    Utilisez cette fonction avec précaution, car elle ne peut pas être annulée. Une fois supprimée,
                    toutes les informations de la salle (nom, description, image, etc.) sont perdues.
                  </p>
                  <p>
                    Pour supprimer une salle, cliquez sur l'icône <Trash2 className="h-4 w-4 inline text-destructive" />
                    dans le tableau des salles. Un message de confirmation vous demandera de valider votre choix avant
                    de procéder à la suppression.
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm space-y-2">
                        <p className="font-semibold text-red-900">Attention : Action irréversible</p>
                        <p>
                          Avant de supprimer une salle, assurez-vous qu'elle n'a pas de réservations actives ou à venir.
                          Si vous souhaitez simplement rendre une salle temporairement indisponible, utilisez plutôt la
                          fonction "Mettre en réserve" qui est réversible et moins radicale.
                        </p>
                        <p>
                          La suppression est recommandée uniquement si vous fermez définitivement un espace ou si vous
                          avez créé une fiche par erreur.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gestion des Réservations */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Gestion des Réservations</CardTitle>
                  <CardDescription className="text-base mt-1">
                    Visualiser et gérer toutes les réservations de manière centralisée
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="text-muted-foreground leading-relaxed space-y-3">
                <p>
                  La gestion des réservations est l'aspect opérationnel quotidien de votre activité de location. Cette
                  section de l'interface vous permet de suivre toutes les réservations en cours et à venir, de créer des
                  réservations manuellement pour des clients qui vous contactent directement, et de gérer les
                  annulations si nécessaire.
                </p>
                <p>
                  Le système de réservation est conçu pour être transparent et automatisé. Chaque réservation, qu'elle
                  provienne d'un visiteur du site ou que vous la créiez vous-même, a exactement le même impact : elle
                  bloque les dates concernées dans le calendrier, empêche les doubles réservations, et calcule
                  automatiquement le prix total basé sur le tarif journalier et la durée de location.
                </p>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  Consulter et visualiser les réservations
                </h3>
                <div className="space-y-4 ml-7 text-muted-foreground leading-relaxed">
                  <p>
                    La page des réservations offre deux modes de visualisation complémentaires pour vous donner une vue
                    complète de votre activité. Vous pouvez basculer entre ces deux vues selon vos besoins du moment.
                  </p>
                  <div className="space-y-4">
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                      <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Vue Calendrier
                      </p>
                      <p className="text-sm mb-3">
                        La vue calendrier affiche toutes vos réservations sur un calendrier mensuel interactif. Chaque
                        réservation apparaît comme un bloc coloré sur les dates concernées, avec un code couleur
                        différent pour chaque salle.
                      </p>
                      <p className="text-sm mb-2 font-semibold text-foreground">Avantages de cette vue :</p>
                      <ul className="list-disc ml-6 space-y-1 text-sm">
                        <li>Vision globale de l'occupation de vos salles sur le mois</li>
                        <li>Identification rapide des périodes creuses et des périodes de forte demande</li>
                        <li>Détection facile des chevauchements ou des disponibilités</li>
                        <li>Planification stratégique de vos opérations de maintenance</li>
                      </ul>
                      <p className="text-sm mt-3">
                        Cliquez sur une réservation dans le calendrier pour voir ses détails complets (client, montant,
                        statut).
                      </p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                      <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Vue Liste
                      </p>
                      <p className="text-sm mb-3">
                        La vue liste présente toutes les réservations sous forme de tableau détaillé avec toutes les
                        informations importantes : nom du client, salle réservée, dates de début et de fin, prix total,
                        et statut de la réservation.
                      </p>
                      <p className="text-sm mb-2 font-semibold text-foreground">Avantages de cette vue :</p>
                      <ul className="list-disc ml-6 space-y-1 text-sm">
                        <li>Accès rapide à toutes les informations de contact des clients</li>
                        <li>Tri et filtrage faciles des réservations</li>
                        <li>Vue d'ensemble des montants et du chiffre d'affaires</li>
                        <li>Actions rapides (annulation) directement depuis la liste</li>
                      </ul>
                      <p className="text-sm mt-3">
                        Cette vue est idéale pour la gestion administrative quotidienne et le suivi des paiements.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Créer une réservation en tant qu'administrateur
                </h3>
                <div className="space-y-4 ml-7 text-muted-foreground leading-relaxed">
                  <p>
                    En tant qu'administrateur, vous avez la possibilité de créer des réservations manuellement. Cette
                    fonctionnalité est essentielle pour plusieurs raisons : certains clients préfèrent réserver par
                    téléphone ou email, vous pouvez avoir des partenariats avec des entreprises qui réservent
                    régulièrement, ou vous souhaitez bloquer des dates pour des événements spéciaux.
                  </p>
                  <p>
                    Les réservations que vous créez ont exactement les mêmes effets que celles créées par les visiteurs
                    du site : elles apparaissent dans le calendrier, bloquent les dates pour éviter les doubles
                    réservations, et sont visibles dans toutes les vues de gestion.
                  </p>
                  <p className="font-semibold text-foreground mt-4">Processus de création étape par étape :</p>
                </div>
                <ol className="space-y-3 ml-7 text-muted-foreground leading-relaxed mt-3">
                  <li className="pl-2">
                    <strong className="text-foreground">1. Accéder au formulaire :</strong> Depuis la page des
                    réservations, cliquez sur le bouton "Créer une réservation". Un formulaire s'ouvrira dans une
                    fenêtre modale.
                  </li>
                  <li className="pl-2">
                    <strong className="text-foreground">2. Sélectionner la salle :</strong> Choisissez la salle à
                    réserver dans le menu déroulant. Seules les salles disponibles (non supprimées) apparaissent dans la
                    liste. Les salles en réserve sont également listées au cas où vous souhaiteriez créer une
                    réservation exceptionnelle.
                  </li>
                  <li className="pl-2">
                    <strong className="text-foreground">3. Choisir les dates :</strong> Sélectionnez la date de début et
                    la date de fin de la réservation. Le calendrier intégré affiche visuellement les dates déjà occupées
                    (grisées et non cliquables) pour vous aider à éviter les conflits. Vous ne pouvez pas sélectionner
                    des dates qui chevauchent une réservation existante pour la même salle.
                  </li>
                  <li className="pl-2">
                    <strong className="text-foreground">4. Calcul automatique du prix :</strong> Dès que vous
                    sélectionnez les dates, le système calcule automatiquement le nombre de jours de location et
                    multiplie ce nombre par le prix journalier de la salle. Le prix total s'affiche en temps réel, vous
                    permettant de communiquer immédiatement le montant au client.
                  </li>
                  <li className="pl-2">
                    <strong className="text-foreground">5. Informations du client :</strong> Remplissez les coordonnées
                    du client :
                    <ul className="list-disc ml-6 mt-2 space-y-1 text-sm">
                      <li>
                        <strong>Nom complet :</strong> Le nom et prénom du client ou le nom de l'entreprise
                      </li>
                      <li>
                        <strong>Email :</strong> L'adresse email de contact (utilisée pour les confirmations)
                      </li>
                      <li>
                        <strong>Téléphone :</strong> Le numéro de téléphone pour les communications urgentes
                      </li>
                    </ul>
                  </li>
                  <li className="pl-2">
                    <strong className="text-foreground">6. Validation :</strong> Vérifiez que toutes les informations
                    sont correctes, puis cliquez sur "Créer la réservation". La réservation est immédiatement
                    enregistrée et apparaît dans le calendrier et la liste des réservations.
                  </li>
                </ol>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 ml-7">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm space-y-2">
                      <p className="font-semibold text-blue-900">Synchronisation instantanée</p>
                      <p>
                        Dès qu'une réservation est créée (par vous ou par un visiteur), elle est immédiatement visible
                        sur le calendrier public. Les visiteurs qui consultent la salle verront les dates bloquées et ne
                        pourront pas les sélectionner. Cette synchronisation en temps réel élimine tout risque de double
                        réservation et garantit que les informations sont toujours à jour.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-destructive" />
                  Annuler une réservation
                </h3>
                <div className="space-y-3 ml-7 text-muted-foreground leading-relaxed">
                  <p>
                    L'annulation d'une réservation peut être nécessaire pour diverses raisons : le client annule sa
                    demande, un problème technique rend la salle indisponible, ou vous devez libérer les dates pour une
                    urgence. Le système facilite ce processus tout en maintenant l'intégrité des données.
                  </p>
                  <p>
                    Pour annuler une réservation, accédez à la vue liste des réservations et cliquez sur le bouton
                    "Annuler" correspondant à la réservation concernée. Un message de confirmation vous demandera de
                    valider votre choix.
                  </p>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mt-3">
                    <p className="font-semibold text-foreground mb-2">Effets de l'annulation :</p>
                    <ul className="list-disc ml-6 space-y-2 text-sm">
                      <li>
                        <strong>Libération des dates :</strong> Les dates précédemment bloquées par cette réservation
                        deviennent immédiatement disponibles pour de nouvelles réservations.
                      </li>
                      <li>
                        <strong>Mise à jour du calendrier :</strong> Le calendrier public et administratif est
                        instantanément mis à jour pour refléter la disponibilité.
                      </li>
                      <li>
                        <strong>Conservation de l'historique :</strong> La réservation annulée reste dans le système
                        avec un statut "Annulée" pour votre suivi et vos archives.
                      </li>
                    </ul>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm space-y-2">
                        <p className="font-semibold text-amber-900">Bonnes pratiques d'annulation</p>
                        <p>
                          Avant d'annuler une réservation, assurez-vous d'avoir communiqué avec le client et documenté
                          la raison de l'annulation. Si l'annulation provient du client, confirmez-la par écrit (email)
                          pour éviter tout malentendu. Si l'annulation vient de votre côté, proposez des alternatives ou
                          des compensations pour maintenir une bonne relation client.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bonnes Pratiques */}
          <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-slate-50 to-white">
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="text-2xl">Bonnes Pratiques et Recommandations</CardTitle>
              <CardDescription className="text-base mt-1">
                Conseils pour optimiser votre utilisation de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4 text-muted-foreground leading-relaxed mb-6">
                <p>
                  Pour tirer le meilleur parti de cette plateforme et maximiser vos réservations, voici une série de
                  recommandations basées sur les meilleures pratiques de gestion de salles et d'espaces événementiels.
                </p>
              </div>
              <ul className="space-y-5 text-muted-foreground leading-relaxed">
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground text-base">
                      Maintenez vos informations à jour en permanence
                    </strong>
                    <p className="text-sm mt-1">
                      Vérifiez régulièrement (au moins une fois par mois) que toutes les informations de vos salles sont
                      exactes et actuelles. Si vous ajoutez de nouveaux équipements, changez la configuration, ou
                      modifiez vos tarifs, mettez à jour les fiches immédiatement. Des informations obsolètes peuvent
                      créer des déceptions et nuire à votre réputation.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground text-base">
                      Investissez dans des visuels de qualité professionnelle
                    </strong>
                    <p className="text-sm mt-1">
                      Les photos sont souvent le premier élément qui attire l'attention d'un client potentiel.
                      Investissez dans un photographe professionnel ou apprenez les bases de la photographie
                      d'intérieur. Mettez à jour vos photos après chaque rénovation ou amélioration significative.
                      Considérez même l'ajout de plusieurs photos par salle pour montrer différents angles et
                      configurations.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground text-base">
                      Rédigez des descriptions complètes et engageantes
                    </strong>
                    <p className="text-sm mt-1">
                      Ne vous contentez pas de lister les équipements. Racontez une histoire : décrivez l'ambiance, les
                      types d'événements qui s'y déroulent avec succès, les avantages uniques de votre espace. Utilisez
                      un langage positif et professionnel. Mentionnez les détails pratiques (parking, accès, services à
                      proximité) qui peuvent faire la différence dans la décision d'un client.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground text-base">
                      Utilisez stratégiquement la fonction "En réserve"
                    </strong>
                    <p className="text-sm mt-1">
                      Plutôt que de supprimer une salle temporairement indisponible, utilisez la fonction "En réserve".
                      Cela maintient la visibilité de votre offre complète tout en informant honnêtement les clients de
                      l'indisponibilité temporaire. Ajoutez une note dans la description expliquant quand la salle sera
                      à nouveau disponible si vous le savez.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground text-base">
                      Consultez régulièrement le calendrier des réservations
                    </strong>
                    <p className="text-sm mt-1">
                      Prenez l'habitude de consulter le calendrier chaque jour ou au moins plusieurs fois par semaine.
                      Cela vous permet d'anticiper les périodes chargées, de planifier vos opérations de maintenance
                      pendant les périodes creuses, et de détecter rapidement toute anomalie ou conflit potentiel. Une
                      bonne connaissance de votre planning vous rend plus réactif et professionnel.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground text-base">
                      Répondez rapidement aux demandes de réservation
                    </strong>
                    <p className="text-sm mt-1">
                      Même si le système gère automatiquement les réservations, assurez-vous de contacter rapidement les
                      clients pour confirmer les détails, répondre à leurs questions, et établir une relation
                      professionnelle. Une communication rapide et efficace augmente la satisfaction client et encourage
                      les réservations répétées.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground text-base">Analysez vos données de réservation</strong>
                    <p className="text-sm mt-1">
                      Utilisez la vue liste pour analyser vos tendances : quelles salles sont les plus demandées ?
                      Quelles périodes de l'année sont les plus actives ? Quels types de clients réservent le plus ? Ces
                      informations vous aideront à ajuster vos prix, à améliorer vos salles moins populaires, et à
                      développer des stratégies marketing ciblées.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground text-base">Documentez vos processus internes</strong>
                    <p className="text-sm mt-1">
                      Créez des procédures standardisées pour la gestion des réservations, les annulations, la
                      préparation des salles, et le suivi client. Cela garantit une qualité de service constante,
                      facilite la formation de nouveaux employés, et réduit les erreurs opérationnelles.
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Support et Assistance */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-200">
              <CardTitle className="text-2xl">Support et Assistance</CardTitle>
              <CardDescription className="text-base mt-1">Besoin d'aide ? Nous sommes là pour vous</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Si vous rencontrez des difficultés techniques, avez des questions sur l'utilisation de la plateforme, ou
                souhaitez suggérer des améliorations, n'hésitez pas à nous contacter. Notre équipe de support est
                disponible pour vous aider à tirer le meilleur parti de cet outil.
              </p>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 mt-4">
                <p className="font-semibold text-foreground mb-3">Ressources disponibles :</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>Ce guide d'utilisation (consultable à tout moment depuis le menu admin)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>Support technique par email pour les problèmes urgents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>Mises à jour régulières avec de nouvelles fonctionnalités</span>
                  </li>
                </ul>
              </div>
              <p className="text-sm italic pt-2">
                Nous améliorons constamment cette plateforme en fonction de vos retours. Vos suggestions sont précieuses
                pour nous aider à créer l'outil de gestion de salles le plus efficace possible.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
