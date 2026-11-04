import { translateAdditional } from "./additionalTranslations";
import { translateNewLocale } from "./newLocaleTranslations";
import { formatPolishLicenseContinue, translatePolish } from "./polishTranslations";

export type Locale = "en" | "de" | "fr" | "es" | "ru" | "it" | "pl";
type ExistingLocale = "de" | "fr" | "es";

type TranslationSet = Record<string, string>;

const translations: Record<ExistingLocale, TranslationSet> = {
  de: {
    "Public Preview": "Öffentliche Vorschau",
    "Overview": "Übersicht",
    "FAQ": "FAQ",
    "Report problem": "Problem melden",
    "Language": "Sprache",
    "Progress": "Fortschritt",
    "Licenses": "Lizenzen",
    "Security goals": "Sicherheitsziele",
    "Recommended templates": "Empfohlene Vorlagen",
    "Number of licenses": "Anzahl der Lizenzen",
    "Find your security policy templates": "Finden Sie Ihre Sicherheitsrichtlinienvorlagen",
    "Which Microsoft 365 licenses does your customer have?": "Über welche Microsoft-365-Lizenzen verfügt Ihr Kunde?",
    "Select each license plan and enter the number of licenses available. Next, choose the security challenges your customer wants to solve to find relevant ALSO security policy templates.": "Wählen Sie die vorhandenen Lizenzpläne aus und geben Sie die Anzahl der verfügbaren Lizenzen ein. Wählen Sie anschließend die Sicherheitsziele Ihres Kunden aus, um passende ALSO-Sicherheitsrichtlinienvorlagen zu finden.",
    "Enterprise": "Unternehmen",
    "SMB": "KMU",
    "Continue with {count} license plan ({seats} seats) →": "Mit {count} Lizenzplan ({seats} Lizenzen) fortfahren →",
    "Continue with {count} license plans ({seats} seats) →": "Mit {count} Lizenzplänen ({seats} Lizenzen) fortfahren →",
    "What security challenges are you trying to solve?": "Welche Sicherheitsziele möchten Sie erreichen?",
    "Select one or more security goals. Select a goal again to remove it. You can combine any goals before continuing.": "Wählen Sie ein oder mehrere Sicherheitsziele aus. Wählen Sie ein Ziel erneut aus, um es zu entfernen. Sie können beliebige Ziele kombinieren.",
    "Your selected security goals": "Ihre ausgewählten Sicherheitsziele",
    "Choose Data Security categories": "Kategorien für Datensicherheit auswählen",
    "Choose the scenarios and platforms to include": "Szenarien und Plattformen auswählen",
    "Select the Purview policy categories to include in your recommendations.": "Wählen Sie die Purview-Richtlinienkategorien für Ihre Empfehlungen aus.",
    "Select one or more options under each goal. Select an option again to remove it. Recommendations will be matched to the licenses selected above.": "Wählen Sie unter jedem Ziel eine oder mehrere Optionen aus. Wählen Sie eine Option erneut aus, um sie zu entfernen. Die Empfehlungen werden auf die oben ausgewählten Lizenzen abgestimmt.",
    "Full experience": "Voller Funktionsumfang",
    "Limited experience": "Eingeschränkter Funktionsumfang",
    "Select at least one security goal": "Wählen Sie mindestens ein Sicherheitsziel aus",
    "Continue with {count} security goal →": "Mit {count} Sicherheitsziel fortfahren →",
    "Continue with {count} security goals →": "Mit {count} Sicherheitszielen fortfahren →",
    "Select at least one option": "Wählen Sie mindestens eine Option aus",
    "View recommendations": "Empfehlungen anzeigen",
    "Back": "Zurück",
    "Start over": "Neu beginnen",
    "License prerequisite": "Lizenzvoraussetzung",
    "A higher license is needed": "Eine höherwertige Lizenz ist erforderlich",
    "No matching repositories for these licenses": "Keine passenden Repositories für diese Lizenzen",
    "The selected security goal does not currently have repositories available for the licenses selected. Review the license selection or choose another security goal.": "Für das ausgewählte Sicherheitsziel sind derzeit keine Repositories für die gewählten Lizenzen verfügbar. Prüfen Sie die Lizenzen oder wählen Sie ein anderes Sicherheitsziel.",
    "Complete template catalog": "Vollständiger Vorlagenkatalog",
    "All security policy templates": "Alle Sicherheitsrichtlinienvorlagen",
    "Browse every available platform and open its policy template repository directly.": "Durchsuchen Sie alle verfügbaren Plattformen und öffnen Sie direkt das zugehörige Vorlagen-Repository.",
    "Search policy templates": "Sicherheitsrichtlinienvorlagen durchsuchen",
    "Search GitHub topics, for example agentsecurity...": "GitHub-Themen durchsuchen, z. B. agentsecurity …",
    "Search": "Suchen",
    "Clear": "Löschen",
    "Loading GitHub topics...": "GitHub-Themen werden geladen …",
    "GitHub topics are temporarily unavailable.": "GitHub-Themen sind vorübergehend nicht verfügbar.",
    "Repository overview": "Repository-Übersicht",
    "Browse all repositories directly.": "Alle Repositories direkt durchsuchen.",
    "Coming": "Demnächst",
    "AI Security macOS repository coming soon": "KI-Sicherheits-Repository für macOS folgt demnächst",
    "AI Security macOS templates coming soon": "KI-Sicherheitsrichtlinienvorlagen für macOS folgen demnächst",
    "No topics configured": "Keine Themen konfiguriert",
    "Open {name} repository": "Repository {name} öffnen",
    "No repository topics found for \"{name}\".": "Keine Repository-Themen für „{name}“ gefunden.",
    "Topics refreshed": "Themen aktualisiert am",
    "repository sections found for": "Repository-Bereiche gefunden für",
    "No repository topics found for": "Keine Repository-Themen gefunden für",
    "Selected eligible licenses": "Ausgewählte berechtigte Lizenzen",
    "License coverage for": "Lizenzabdeckung für",
    "Count unavailable": "Anzahl nicht verfügbar",
    "Loading count": "Anzahl wird geladen",
    "options": "Optionen",
    "and the needs you selected, explore these ALSO repositories.": "und Ihren ausgewählten Anforderungen finden Sie hier passende ALSO-Repositories.",
    "Mixed license coverage": "Lizenzmix-Abdeckung",
    "Recommendations are evaluated against each selected plan and its seat count. A higher-tier plan does not extend its entitlements to users assigned another plan; the counts do not show whether the same users hold multiple plans.": "Empfehlungen werden für jeden ausgewählten Plan und seine Lizenzanzahl bewertet. Ein höherwertiger Plan erweitert seine Berechtigungen nicht auf Benutzer mit einem anderen Plan. Die Anzahlen zeigen nicht, ob dieselben Personen mehrere Pläne besitzen.",
    "Coverage by selected plan": "Abdeckung nach ausgewähltem Plan",
    "not available for this selection": "für diese Auswahl nicht verfügbar",
    "experience": "Funktionsumfang",
    "Recommended for": "Empfohlen für",
    "Recommended Conditional Access policies:": "Empfohlene Conditional-Access-Richtlinien:",
    "Learn more about Agent 365 licensing:": "Weitere Informationen zur Agent-365-Lizenzierung:",
    "Microsoft Entra Workload ID Premium required for full experience": "Microsoft Entra Workload ID Premium ist für den vollen Funktionsumfang erforderlich",
    "Additional server license required": "Zusätzliche Serverlizenz erforderlich",
    "Coming soon": "Demnächst verfügbar",
    "ALSO Microsoft Security Central Technical Team (c) 2026 All rights reserved": "ALSO Microsoft Security Central Technical Team (c) 2026 Alle Rechte vorbehalten",
    "{count} repository sections found for \"{name}\".": "{count} Repository-Bereiche für „{name}“ gefunden.",
    "does not meet the minimum prerequisite for these security policy templates.": "erfüllt nicht die Mindestvoraussetzungen für diese Sicherheitsrichtlinienvorlagen.",
    "do not meet the minimum prerequisite for these security policy templates.": "erfüllen nicht die Mindestvoraussetzungen für diese Sicherheitsrichtlinienvorlagen.",
    "do not include Microsoft Entra ID P1, Intune Plan 1, or Microsoft Defender for Business, which are the minimum prerequisites for using our templates.": "enthalten weder Microsoft Entra ID P1 noch Intune Plan 1 oder Microsoft Defender for Business, die Mindestvoraussetzungen für unsere Vorlagen sind.",
    "No applicable templates are available for your selected licenses.": "Für Ihre ausgewählten Lizenzen sind keine passenden Vorlagen verfügbar.",
    "Selected needs": "Ausgewählte Anforderungen",
    "Recommended security policy templates": "Empfohlene Sicherheitsrichtlinienvorlagen",
    "Based on": "Basierend auf",
    "The minimum supported license is": "Die mindestens erforderliche Lizenz ist",
    "Need implementation help or consulting?": "Benötigen Sie Hilfe bei der Implementierung oder Beratung?",
    "Request Professional Services Help from ALSO CoE": "Professionelle Unterstützung vom ALSO CoE anfordern",
    "Daily repository sync": "Tägliche Repository-Synchronisierung",
    "Zero trust at zero cost.": "Zero Trust ohne zusätzliche Kosten.",
    "Free Microsoft Security policy templates that help turn days of research, configuration, and testing into minutes of deployment.": "Kostenlose Microsoft-Security-Vorlagen, mit denen aus Tagen für Recherche, Konfiguration und Tests nur Minuten für die Bereitstellung werden.",
    "Grab a coffee, pick templates, import them into your lab, test them, tweak them, and make them your own. Build the security baseline that works for your customers.": "Wählen Sie Vorlagen aus, importieren Sie sie in Ihre Testumgebung, prüfen und passen Sie sie an. Erstellen Sie die Sicherheitsbaseline, die zu Ihrem Kunden passt.",
    "Last sync": "Letzte Synchronisierung",
    "Loading sync information...": "Synchronisierungsdaten werden geladen …",
    "Sync information unavailable": "Synchronisierungsdaten nicht verfügbar",
    "Repository counts could not be loaded. Please reload the page to try again.": "Die Repository-Anzahlen konnten nicht geladen werden. Laden Sie die Seite erneut.",
    "Category totals are temporarily unavailable.": "Kategorie-Summen sind vorübergehend nicht verfügbar.",
    "Total": "Gesamt",
    "Conditional Access policies": "Conditional-Access-Richtlinien",
    "Endpoint policies": "Endpunktrichtlinien",
    "Endpoint compliance policies": "Gerätekompatibilitätsrichtlinien",
    "Scripts": "Skripte",
    "Filter settings": "Filtereinstellungen",
    "Applications": "Anwendungen",
    "Purview policies": "Purview-Richtlinien",
    "Help and information": "Hilfe und Informationen",
    "Frequently asked questions": "Häufig gestellte Fragen",
    "Learn about the ALSO Security Policy Templates Navigator, our templates, and deployment tools.": "Erfahren Sie mehr über den ALSO Security Policy Templates Navigator, unsere Vorlagen und Bereitstellungstools.",
    "License and professional services options": "Lizenz- und Professional-Services-Optionen",
    "Explore licenses": "Lizenzen entdecken",
    "Explore Agent 365 licenses in ACMP": "Agent-365-Lizenzen in ACMP entdecken",
    "Explore Microsoft 365 E7 licenses in ACMP": "Microsoft-365-E7-Lizenzen in ACMP entdecken",
    "Licensing prerequisites": "Lizenzvoraussetzungen",
    "Disclaimer:": "Haftungsausschluss:",
    "Enterprise licenses:": "Unternehmenslizenzen:",
    "SMB licenses:": "KMU-Lizenzen:",
    "Microsoft Enterprise Plan Comparison": "Vergleich der Microsoft-Unternehmenspläne",
    "Microsoft SMB Plan Comparison": "Vergleich der Microsoft-KMU-Pläne",
    "Selected plan mix: ": "Ausgewählte Lizenzpläne: ",
    "license": "Lizenz",
    "licenses": "Lizenzen",
    "seats": "Lizenzen",
    "does not include Microsoft Entra ID P1, Intune Plan 1, or Microsoft Defender for Business, which are the minimum prerequisites for using our templates.": "enthält weder Microsoft Entra ID P1 noch Intune Plan 1 oder Microsoft Defender for Business, die Mindestvoraussetzungen für unsere Vorlagen sind.",
    "Licensing prerequisites and feature availability listed on this page may be incorrect, incomplete, or outdated. We strongly recommend verifying all licensing information against the latest official Microsoft licensing documentation before making any purchasing or deployment decisions.": "Die hier aufgeführten Lizenzvoraussetzungen und Funktionsverfügbarkeiten können fehlerhaft, unvollständig oder veraltet sein. Prüfen Sie alle Lizenzinformationen anhand der aktuellen offiziellen Microsoft-Dokumentation, bevor Sie Kauf- oder Bereitstellungsentscheidungen treffen.",
    "Full coverage is included with this plan.": "Der volle Funktionsumfang ist in diesem Plan enthalten.",
    "Full Cloud apps coverage is included with this plan.": "Der volle Funktionsumfang für Cloud-Apps ist in diesem Plan enthalten.",
    "No additional server licensing note for this plan.": "Für diesen Plan sind keine weiteren Serverlizenzierungshinweise erforderlich.",
    "Server requirements apply to users or devices covered by each matching plan.": "Serveranforderungen gelten für Benutzer oder Geräte, die durch den jeweiligen Lizenzplan abgedeckt sind.",
    "This baseline delivers a hardened Windows 11 configuration that minimizes the risk of unauthorized third-party AI access while maintaining a productive user experience": "Diese Baseline bietet eine gehärtete Windows-11-Konfiguration, die das Risiko eines unbefugten Zugriffs durch KI von Drittanbietern minimiert und gleichzeitig produktives Arbeiten ermöglicht.",
    "This baseline delivers a hardened MacOS configuration that minimizes the risk of unauthorized third-party AI access while maintaining a productive user experience,": "Diese Baseline bietet eine gehärtete macOS-Konfiguration, die das Risiko eines unbefugten Zugriffs durch KI von Drittanbietern minimiert und gleichzeitig produktives Arbeiten ermöglicht.",
    "Windows 11 policy templates for protecting AI agent operating environments.": "Windows-11-Richtlinienvorlagen zum Schutz von Betriebsumgebungen für KI-Agenten.",
    "Conditional Access policy templates for protecting AI agent access.": "Conditional-Access-Richtlinienvorlagen zum Schutz des Zugriffs von KI-Agenten.",
    "All policies belonging to Windows": "Alle zu Windows gehörenden Richtlinien",
    "No repository description is currently provided in GitHub About.": "In GitHub About ist derzeit keine Repository-Beschreibung hinterlegt.",
    "A collection of Microsoft Security Windows Server policies to help organizations accelerate secure deployments to servers with Defender for Servers (Defender for Cloud), Defender Business for Servers and Endpoint for Servers with Intune.": "Eine Sammlung von Microsoft-Security-Richtlinien für Windows Server, die sichere Bereitstellungen mit Microsoft Defender for Servers (Microsoft Defender for Cloud), Microsoft Defender for Business servers und Microsoft Defender for Endpoint Server mit Intune erleichtert.",
    "A collection of Microsoft Security Linux Server and Desktop policies to help organizations accelerate secure deployments to servers with Defender for Endpoint, Defender for Servers (Defender for Cloud), Defender Business for Servers and Endpoint for Servers with Intune.": "Eine Sammlung von Microsoft-Security-Richtlinien für Linux-Server und -Desktops, die sichere Bereitstellungen mit Microsoft Defender for Endpoint, Microsoft Defender for Servers (Microsoft Defender for Cloud), Microsoft Defender for Business servers und Microsoft Defender for Endpoint Server mit Intune erleichtert.",
    "A collection of Microsoft Security MacOS policy to help organizations automate onboarding/offboarding of Macbook's to/from Defender with Intune, accelerate secure deployments and implement Microsoft Security best practices with Zero trust principles.": "Eine Sammlung von Microsoft-Security-Richtlinien für macOS zur Automatisierung des Ein- und Ausstiegs von MacBooks bei Defender mit Intune, zur Beschleunigung sicherer Bereitstellungen und zur Umsetzung bewährter Microsoft-Security- und Zero-Trust-Prinzipien.",
    "Collection of Microsoft Security policy templates for iOS and iPadOS devices, covering both BYOD (Bring Your Own Device) and corporate-managed deployments.": "Sammlung von Microsoft-Security-Richtlinienvorlagen für iOS- und iPadOS-Geräte für BYOD- und unternehmensverwaltete Bereitstellungen.",
    "All about managing android": "Alles rund um die Verwaltung von Android",
    "A collection of Microsoft Entra Conditional Access policy templates, named locations, security groups and authentication context designed to help organizations accelerate secure deployments and implement Microsoft Security best practices with Zero trust principles.": "Eine Sammlung von Microsoft-Entra-Conditional-Access-Richtlinienvorlagen, benannten Standorten, Sicherheitsgruppen und Authentifizierungskontexten zur Beschleunigung sicherer Bereitstellungen und zur Umsetzung bewährter Microsoft-Security- und Zero-Trust-Prinzipien.",
  },
  fr: {
    "Public Preview": "Aperçu public",
    "Overview": "Vue d’ensemble",
    "FAQ": "FAQ",
    "Report problem": "Signaler un problème",
    "Language": "Langue",
    "Progress": "Progression",
    "Licenses": "Licences",
    "Security goals": "Objectifs de sécurité",
    "Recommended templates": "Modèles recommandés",
    "Number of licenses": "Nombre de licences",
    "Find your security policy templates": "Trouvez vos modèles de stratégie de sécurité",
    "Which Microsoft 365 licenses does your customer have?": "De quelles licences Microsoft 365 votre client dispose-t-il ?",
    "Select each license plan and enter the number of licenses available. Next, choose the security challenges your customer wants to solve to find relevant ALSO security policy templates.": "Sélectionnez chaque offre de licences et indiquez le nombre de licences disponibles. Choisissez ensuite les défis de sécurité de votre client pour trouver les modèles de stratégie ALSO adaptés.",
    "Enterprise": "Entreprise",
    "SMB": "PME",
    "Continue with {count} license plan ({seats} seats) →": "Continuer avec {count} offre de licences ({seats} licences) →",
    "Continue with {count} license plans ({seats} seats) →": "Continuer avec {count} offres de licences ({seats} licences) →",
    "What security challenges are you trying to solve?": "Quels défis de sécurité souhaitez-vous relever ?",
    "Select one or more security goals. Select a goal again to remove it. You can combine any goals before continuing.": "Sélectionnez un ou plusieurs objectifs de sécurité. Sélectionnez à nouveau un objectif pour le retirer. Vous pouvez combiner plusieurs objectifs.",
    "Your selected security goals": "Vos objectifs de sécurité sélectionnés",
    "Choose Data Security categories": "Choisir les catégories de sécurité des données",
    "Choose the scenarios and platforms to include": "Choisir les scénarios et les plateformes à inclure",
    "Select the Purview policy categories to include in your recommendations.": "Sélectionnez les catégories de stratégie Purview à inclure dans vos recommandations.",
    "Select one or more options under each goal. Select an option again to remove it. Recommendations will be matched to the licenses selected above.": "Sélectionnez une ou plusieurs options sous chaque objectif. Sélectionnez à nouveau une option pour la retirer. Les recommandations seront adaptées aux licences sélectionnées.",
    "Full experience": "Expérience complète",
    "Limited experience": "Expérience limitée",
    "Select at least one security goal": "Sélectionnez au moins un objectif de sécurité",
    "Continue with {count} security goal →": "Continuer avec {count} objectif de sécurité →",
    "Continue with {count} security goals →": "Continuer avec {count} objectifs de sécurité →",
    "Select at least one option": "Sélectionnez au moins une option",
    "View recommendations": "Afficher les recommandations",
    "Back": "Retour",
    "Start over": "Recommencer",
    "License prerequisite": "Prérequis de licence",
    "A higher license is needed": "Une licence supérieure est nécessaire",
    "No matching repositories for these licenses": "Aucun dépôt correspondant à ces licences",
    "The selected security goal does not currently have repositories available for the licenses selected. Review the license selection or choose another security goal.": "Aucun dépôt n’est actuellement disponible pour les licences sélectionnées et cet objectif de sécurité. Vérifiez les licences ou choisissez un autre objectif.",
    "Complete template catalog": "Catalogue complet des modèles",
    "All security policy templates": "Tous les modèles de stratégie de sécurité",
    "Browse every available platform and open its policy template repository directly.": "Parcourez toutes les plateformes disponibles et ouvrez directement leur dépôt de modèles.",
    "Search policy templates": "Rechercher des modèles de stratégie",
    "Search GitHub topics, for example agentsecurity...": "Rechercher des sujets GitHub, par exemple agentsecurity…",
    "Search": "Rechercher",
    "Clear": "Effacer",
    "Loading GitHub topics...": "Chargement des sujets GitHub…",
    "GitHub topics are temporarily unavailable.": "Les sujets GitHub sont temporairement indisponibles.",
    "Repository overview": "Vue d’ensemble des dépôts",
    "Browse all repositories directly.": "Parcourir directement tous les dépôts.",
    "Coming": "Bientôt",
    "AI Security macOS repository coming soon": "Dépôt AI Security pour macOS bientôt disponible",
    "AI Security macOS templates coming soon": "Modèles AI Security pour macOS bientôt disponibles",
    "No topics configured": "Aucun sujet configuré",
    "Open {name} repository": "Ouvrir le dépôt {name}",
    "No repository topics found for \"{name}\".": "Aucun sujet de dépôt trouvé pour « {name} ».",
    "Topics refreshed": "Sujets actualisés le",
    "repository sections found for": "sections de dépôt trouvées pour",
    "No repository topics found for": "Aucun sujet de dépôt trouvé pour",
    "Selected eligible licenses": "Licences éligibles sélectionnées",
    "License coverage for": "Couverture de licence pour",
    "Count unavailable": "Nombre indisponible",
    "Loading count": "Chargement du nombre",
    "options": "options",
    "and the needs you selected, explore these ALSO repositories.": "et de vos besoins, découvrez ces dépôts ALSO.",
    "Mixed license coverage": "Couverture des offres mixtes",
    "Recommendations are evaluated against each selected plan and its seat count. A higher-tier plan does not extend its entitlements to users assigned another plan; the counts do not show whether the same users hold multiple plans.": "Les recommandations sont évaluées selon chaque offre sélectionnée et son nombre de licences. Une offre supérieure n’étend pas ses droits aux utilisateurs d’une autre offre. Le nombre de licences n’indique pas si les mêmes personnes disposent de plusieurs offres.",
    "Coverage by selected plan": "Couverture par offre sélectionnée",
    "not available for this selection": "indisponible pour cette sélection",
    "experience": "expérience",
    "Recommended for": "Recommandé pour",
    "Recommended Conditional Access policies:": "Stratégies d’accès conditionnel recommandées :",
    "Learn more about Agent 365 licensing:": "En savoir plus sur les licences Agent 365 :",
    "Microsoft Entra Workload ID Premium required for full experience": "Microsoft Entra Workload ID Premium est requis pour l’expérience complète",
    "Additional server license required": "Licence serveur supplémentaire requise",
    "Coming soon": "Bientôt disponible",
    "ALSO Microsoft Security Central Technical Team (c) 2026 All rights reserved": "ALSO Microsoft Security Central Technical Team (c) 2026 Tous droits réservés",
    "{count} repository sections found for \"{name}\".": "{count} sections de dépôt trouvées pour « {name} ».",
    "does not meet the minimum prerequisite for these security policy templates.": "ne respecte pas les prérequis minimaux de ces modèles de stratégie de sécurité.",
    "do not meet the minimum prerequisite for these security policy templates.": "ne respectent pas les prérequis minimaux de ces modèles de stratégie de sécurité.",
    "do not include Microsoft Entra ID P1, Intune Plan 1, or Microsoft Defender for Business, which are the minimum prerequisites for using our templates.": "n’incluent pas Microsoft Entra ID P1, Intune Plan 1 ni Microsoft Defender for Business, qui sont les prérequis minimaux pour utiliser nos modèles.",
    "No applicable templates are available for your selected licenses.": "Aucun modèle correspondant à vos licences n’est disponible.",
    "Selected needs": "Besoins sélectionnés",
    "Recommended security policy templates": "Modèles de stratégie de sécurité recommandés",
    "Based on": "Sur la base de",
    "The minimum supported license is": "La licence minimale requise est",
    "Need implementation help or consulting?": "Besoin d’aide pour la mise en œuvre ou de conseils ?",
    "Request Professional Services Help from ALSO CoE": "Demander l’aide des services professionnels ALSO CoE",
    "Daily repository sync": "Synchronisation quotidienne des dépôts",
    "Zero trust at zero cost.": "Le Zero Trust sans frais supplémentaires.",
    "Free Microsoft Security policy templates that help turn days of research, configuration, and testing into minutes of deployment.": "Des modèles gratuits de stratégies Microsoft Security qui transforment des jours de recherche, de configuration et de tests en quelques minutes de déploiement.",
    "Grab a coffee, pick templates, import them into your lab, test them, tweak them, and make them your own. Build the security baseline that works for your customers.": "Choisissez des modèles, importez-les dans votre environnement de test, vérifiez-les et adaptez-les. Créez la base de sécurité qui convient à vos clients.",
    "Last sync": "Dernière synchronisation",
    "Loading sync information...": "Chargement des informations de synchronisation…",
    "Sync information unavailable": "Informations de synchronisation indisponibles",
    "Repository counts could not be loaded. Please reload the page to try again.": "Impossible de charger les nombres de dépôts. Rechargez la page pour réessayer.",
    "Category totals are temporarily unavailable.": "Les totaux par catégorie sont temporairement indisponibles.",
    "Total": "Total",
    "Conditional Access policies": "Stratégies d’accès conditionnel",
    "Endpoint policies": "Stratégies de points de terminaison",
    "Endpoint compliance policies": "Stratégies de conformité d’appareils",
    "Scripts": "Scripts",
    "Filter settings": "Paramètres de filtre",
    "Applications": "Applications",
    "Purview policies": "Stratégies Purview",
    "Help and information": "Aide et informations",
    "Frequently asked questions": "Questions fréquentes",
    "Learn about the ALSO Security Policy Templates Navigator, our templates, and deployment tools.": "Découvrez ALSO Security Policy Templates Navigator, nos modèles et nos outils de déploiement.",
    "License and professional services options": "Options de licences et de services professionnels",
    "Explore licenses": "Découvrir les licences",
    "Explore Agent 365 licenses in ACMP": "Découvrir les licences Agent 365 dans ACMP",
    "Explore Microsoft 365 E7 licenses in ACMP": "Découvrir les licences Microsoft 365 E7 dans ACMP",
    "Licensing prerequisites": "Prérequis de licence",
    "Disclaimer:": "Avertissement :",
    "Enterprise licenses:": "Licences Entreprise :",
    "SMB licenses:": "Licences PME :",
    "Microsoft Enterprise Plan Comparison": "Comparaison des offres Microsoft Entreprise",
    "Microsoft SMB Plan Comparison": "Comparaison des offres Microsoft PME",
    "Selected plan mix: ": "Offres de licences sélectionnées : ",
    "license": "licence",
    "licenses": "licences",
    "seats": "licences",
    "does not include Microsoft Entra ID P1, Intune Plan 1, or Microsoft Defender for Business, which are the minimum prerequisites for using our templates.": "n’inclut pas Microsoft Entra ID P1, Intune Plan 1 ni Microsoft Defender for Business, qui sont les prérequis minimaux pour utiliser nos modèles.",
    "Licensing prerequisites and feature availability listed on this page may be incorrect, incomplete, or outdated. We strongly recommend verifying all licensing information against the latest official Microsoft licensing documentation before making any purchasing or deployment decisions.": "Les prérequis de licence et la disponibilité des fonctionnalités indiqués sur cette page peuvent être inexacts, incomplets ou obsolètes. Vérifiez toutes les informations de licence dans la documentation Microsoft officielle la plus récente avant toute décision d’achat ou de déploiement.",
    "Full coverage is included with this plan.": "La couverture complète est incluse dans cette offre.",
    "Full Cloud apps coverage is included with this plan.": "La couverture complète des applications cloud est incluse dans cette offre.",
    "No additional server licensing note for this plan.": "Aucune licence serveur supplémentaire n’est à signaler pour cette offre.",
    "Server requirements apply to users or devices covered by each matching plan.": "Les exigences serveur s’appliquent aux utilisateurs ou appareils couverts par chaque offre correspondante.",
    "This baseline delivers a hardened Windows 11 configuration that minimizes the risk of unauthorized third-party AI access while maintaining a productive user experience": "Cette base fournit une configuration Windows 11 renforcée qui réduit le risque d’accès non autorisé par des IA tierces tout en préservant la productivité.",
    "This baseline delivers a hardened MacOS configuration that minimizes the risk of unauthorized third-party AI access while maintaining a productive user experience,": "Cette base fournit une configuration macOS renforcée qui réduit le risque d’accès non autorisé par des IA tierces tout en préservant la productivité.",
    "Windows 11 policy templates for protecting AI agent operating environments.": "Modèles de stratégies Windows 11 pour protéger les environnements d’exécution des agents d’IA.",
    "Conditional Access policy templates for protecting AI agent access.": "Modèles de stratégies d’accès conditionnel pour protéger l’accès des agents d’IA.",
    "All policies belonging to Windows": "Toutes les stratégies Windows",
    "No repository description is currently provided in GitHub About.": "Aucune description du dépôt n’est actuellement fournie dans la section À propos de GitHub.",
    "A collection of Microsoft Security Windows Server policies to help organizations accelerate secure deployments to servers with Defender for Servers (Defender for Cloud), Defender Business for Servers and Endpoint for Servers with Intune.": "Collection de stratégies Microsoft Security pour Windows Server, afin d’accélérer les déploiements sécurisés avec Defender for Servers (Defender for Cloud), Defender for Business pour les serveurs et Endpoint for Servers avec Intune.",
    "A collection of Microsoft Security Linux Server and Desktop policies to help organizations accelerate secure deployments to servers with Defender for Endpoint, Defender for Servers (Defender for Cloud), Defender Business for Servers and Endpoint for Servers with Intune.": "Collection de stratégies Microsoft Security pour Linux Server et Desktop, afin d’accélérer les déploiements sécurisés avec Defender for Endpoint, Defender for Servers (Defender for Cloud), Defender for Business pour les serveurs et Endpoint for Servers avec Intune.",
    "A collection of Microsoft Security MacOS policy to help organizations automate onboarding/offboarding of Macbook's to/from Defender with Intune, accelerate secure deployments and implement Microsoft Security best practices with Zero trust principles.": "Collection de stratégies Microsoft Security pour macOS visant à automatiser l’intégration et le retrait des MacBook de Defender avec Intune, accélérer les déploiements sécurisés et appliquer les bonnes pratiques Microsoft Security et Zero Trust.",
    "Collection of Microsoft Security policy templates for iOS and iPadOS devices, covering both BYOD (Bring Your Own Device) and corporate-managed deployments.": "Collection de modèles de stratégies Microsoft Security pour les appareils iOS et iPadOS, couvrant les déploiements BYOD et les appareils gérés par l’entreprise.",
    "All about managing android": "Tout sur la gestion d’Android",
    "A collection of Microsoft Entra Conditional Access policy templates, named locations, security groups and authentication context designed to help organizations accelerate secure deployments and implement Microsoft Security best practices with Zero trust principles.": "Collection de modèles de stratégies d’accès conditionnel Microsoft Entra, d’emplacements nommés, de groupes de sécurité et de contextes d’authentification pour accélérer les déploiements sécurisés et appliquer les bonnes pratiques Microsoft Security et Zero Trust.",
  },
  es: {
    "Public Preview": "Versión preliminar pública",
    "Overview": "Resumen",
    "FAQ": "Preguntas frecuentes",
    "Report problem": "Informar de un problema",
    "Language": "Idioma",
    "Progress": "Progreso",
    "Licenses": "Licencias",
    "Security goals": "Objetivos de seguridad",
    "Recommended templates": "Plantillas recomendadas",
    "Number of licenses": "Número de licencias",
    "Find your security policy templates": "Encuentre sus plantillas de directivas de seguridad",
    "Which Microsoft 365 licenses does your customer have?": "¿Qué licencias de Microsoft 365 tiene su cliente?",
    "Select each license plan and enter the number of licenses available. Next, choose the security challenges your customer wants to solve to find relevant ALSO security policy templates.": "Seleccione cada plan de licencias e indique cuántas licencias tiene disponibles. Después, elija los desafíos de seguridad que quiere resolver su cliente para encontrar las plantillas de directivas ALSO adecuadas.",
    "Enterprise": "Empresa",
    "SMB": "PYME",
    "Continue with {count} license plan ({seats} seats) →": "Continuar con {count} plan de licencias ({seats} licencias) →",
    "Continue with {count} license plans ({seats} seats) →": "Continuar con {count} planes de licencias ({seats} licencias) →",
    "What security challenges are you trying to solve?": "¿Qué desafíos de seguridad quiere resolver?",
    "Select one or more security goals. Select a goal again to remove it. You can combine any goals before continuing.": "Seleccione uno o varios objetivos de seguridad. Vuelva a seleccionar un objetivo para quitarlo. Puede combinar varios objetivos.",
    "Your selected security goals": "Objetivos de seguridad seleccionados",
    "Choose Data Security categories": "Elegir categorías de seguridad de datos",
    "Choose the scenarios and platforms to include": "Elegir los escenarios y las plataformas que se incluirán",
    "Select the Purview policy categories to include in your recommendations.": "Seleccione las categorías de directivas de Purview que se incluirán en las recomendaciones.",
    "Select one or more options under each goal. Select an option again to remove it. Recommendations will be matched to the licenses selected above.": "Seleccione una o varias opciones en cada objetivo. Vuelva a seleccionar una opción para quitarla. Las recomendaciones se ajustarán a las licencias seleccionadas.",
    "Full experience": "Experiencia completa",
    "Limited experience": "Experiencia limitada",
    "Select at least one security goal": "Seleccione al menos un objetivo de seguridad",
    "Continue with {count} security goal →": "Continuar con {count} objetivo de seguridad →",
    "Continue with {count} security goals →": "Continuar con {count} objetivos de seguridad →",
    "Select at least one option": "Seleccione al menos una opción",
    "View recommendations": "Ver recomendaciones",
    "Back": "Atrás",
    "Start over": "Empezar de nuevo",
    "License prerequisite": "Requisito de licencia",
    "A higher license is needed": "Se necesita una licencia superior",
    "No matching repositories for these licenses": "No hay repositorios que coincidan con estas licencias",
    "The selected security goal does not currently have repositories available for the licenses selected. Review the license selection or choose another security goal.": "El objetivo de seguridad seleccionado no tiene repositorios disponibles para las licencias elegidas. Revise las licencias o elija otro objetivo.",
    "Complete template catalog": "Catálogo completo de plantillas",
    "All security policy templates": "Todas las plantillas de directivas de seguridad",
    "Browse every available platform and open its policy template repository directly.": "Explore todas las plataformas disponibles y abra directamente el repositorio de plantillas correspondiente.",
    "Search policy templates": "Buscar plantillas de directivas",
    "Search GitHub topics, for example agentsecurity...": "Buscar temas de GitHub, por ejemplo, agentsecurity…",
    "Search": "Buscar",
    "Clear": "Borrar",
    "Loading GitHub topics...": "Cargando temas de GitHub…",
    "GitHub topics are temporarily unavailable.": "Los temas de GitHub no están disponibles temporalmente.",
    "Repository overview": "Información general de repositorios",
    "Browse all repositories directly.": "Explore directamente todos los repositorios.",
    "Coming": "Próximamente",
    "AI Security macOS repository coming soon": "El repositorio de AI Security para macOS estará disponible próximamente",
    "AI Security macOS templates coming soon": "Las plantillas de AI Security para macOS estarán disponibles próximamente",
    "No topics configured": "No hay temas configurados",
    "Open {name} repository": "Abrir el repositorio {name}",
    "No repository topics found for \"{name}\".": "No se encontraron temas de repositorio para «{name}».",
    "Topics refreshed": "Temas actualizados el",
    "repository sections found for": "secciones de repositorio encontradas para",
    "No repository topics found for": "No se encontraron temas de repositorio para",
    "Selected eligible licenses": "Licencias aptas seleccionadas",
    "License coverage for": "Cobertura de licencias para",
    "Count unavailable": "Recuento no disponible",
    "Loading count": "Cargando recuento",
    "options": "opciones",
    "and the needs you selected, explore these ALSO repositories.": "y las necesidades que seleccionó, explore estos repositorios de ALSO.",
    "Mixed license coverage": "Cobertura de licencias mixtas",
    "Recommendations are evaluated against each selected plan and its seat count. A higher-tier plan does not extend its entitlements to users assigned another plan; the counts do not show whether the same users hold multiple plans.": "Las recomendaciones se evalúan según cada plan seleccionado y su número de licencias. Un plan de nivel superior no amplía sus derechos a los usuarios asignados a otro plan. El recuento no indica si las mismas personas tienen varios planes.",
    "Coverage by selected plan": "Cobertura por plan seleccionado",
    "not available for this selection": "no disponible para esta selección",
    "experience": "experiencia",
    "Recommended for": "Recomendado para",
    "Recommended Conditional Access policies:": "Directivas de acceso condicional recomendadas:",
    "Learn more about Agent 365 licensing:": "Más información sobre las licencias de Agent 365:",
    "Microsoft Entra Workload ID Premium required for full experience": "Se requiere Microsoft Entra Workload ID Premium para la experiencia completa",
    "Additional server license required": "Se requiere una licencia de servidor adicional",
    "Coming soon": "Próximamente",
    "ALSO Microsoft Security Central Technical Team (c) 2026 All rights reserved": "ALSO Microsoft Security Central Technical Team (c) 2026 Todos los derechos reservados",
    "{count} repository sections found for \"{name}\".": "Se encontraron {count} secciones de repositorio para «{name}».",
    "does not meet the minimum prerequisite for these security policy templates.": "no cumple los requisitos mínimos para estas plantillas de directivas de seguridad.",
    "do not meet the minimum prerequisite for these security policy templates.": "no cumplen los requisitos mínimos para estas plantillas de directivas de seguridad.",
    "do not include Microsoft Entra ID P1, Intune Plan 1, or Microsoft Defender for Business, which are the minimum prerequisites for using our templates.": "no incluyen Microsoft Entra ID P1, Intune Plan 1 ni Microsoft Defender for Business, que son los requisitos mínimos para usar nuestras plantillas.",
    "No applicable templates are available for your selected licenses.": "No hay plantillas aplicables para las licencias seleccionadas.",
    "Selected needs": "Necesidades seleccionadas",
    "Recommended security policy templates": "Plantillas de directivas de seguridad recomendadas",
    "Based on": "Según",
    "The minimum supported license is": "La licencia mínima admitida es",
    "Need implementation help or consulting?": "¿Necesita ayuda con la implementación o asesoramiento?",
    "Request Professional Services Help from ALSO CoE": "Solicitar ayuda de servicios profesionales de ALSO CoE",
    "Daily repository sync": "Sincronización diaria de repositorios",
    "Zero trust at zero cost.": "Zero Trust sin coste adicional.",
    "Free Microsoft Security policy templates that help turn days of research, configuration, and testing into minutes of deployment.": "Plantillas gratuitas de directivas de Microsoft Security que convierten días de investigación, configuración y pruebas en minutos de implementación.",
    "Grab a coffee, pick templates, import them into your lab, test them, tweak them, and make them your own. Build the security baseline that works for your customers.": "Elija plantillas, impórtelas en su entorno de pruebas, revíselas y adáptelas. Cree la línea base de seguridad adecuada para sus clientes.",
    "Last sync": "Última sincronización",
    "Loading sync information...": "Cargando información de sincronización…",
    "Sync information unavailable": "Información de sincronización no disponible",
    "Repository counts could not be loaded. Please reload the page to try again.": "No se pudieron cargar los recuentos de repositorios. Vuelva a cargar la página para intentarlo de nuevo.",
    "Category totals are temporarily unavailable.": "Los totales por categoría no están disponibles temporalmente.",
    "Total": "Total",
    "Conditional Access policies": "Directivas de acceso condicional",
    "Endpoint policies": "Directivas de puntos de conexión",
    "Endpoint compliance policies": "Directivas de cumplimiento de dispositivos",
    "Scripts": "Scripts",
    "Filter settings": "Configuración de filtros",
    "Applications": "Aplicaciones",
    "Purview policies": "Directivas de Purview",
    "Help and information": "Ayuda e información",
    "Frequently asked questions": "Preguntas frecuentes",
    "Learn about the ALSO Security Policy Templates Navigator, our templates, and deployment tools.": "Obtenga información sobre ALSO Security Policy Templates Navigator, nuestras plantillas y herramientas de implementación.",
    "License and professional services options": "Opciones de licencias y servicios profesionales",
    "Explore licenses": "Explorar licencias",
    "Explore Agent 365 licenses in ACMP": "Explorar licencias de Agent 365 en ACMP",
    "Explore Microsoft 365 E7 licenses in ACMP": "Explorar licencias de Microsoft 365 E7 en ACMP",
    "Licensing prerequisites": "Requisitos de licencia",
    "Disclaimer:": "Aviso:",
    "Enterprise licenses:": "Licencias Enterprise:",
    "SMB licenses:": "Licencias PYME:",
    "Microsoft Enterprise Plan Comparison": "Comparación de planes Microsoft Enterprise",
    "Microsoft SMB Plan Comparison": "Comparación de planes Microsoft PYME",
    "Selected plan mix: ": "Combinación de planes seleccionados: ",
    "license": "licencia",
    "licenses": "licencias",
    "seats": "licencias",
    "does not include Microsoft Entra ID P1, Intune Plan 1, or Microsoft Defender for Business, which are the minimum prerequisites for using our templates.": "no incluye Microsoft Entra ID P1, Intune Plan 1 ni Microsoft Defender for Business, requisitos mínimos para usar nuestras plantillas.",
    "Licensing prerequisites and feature availability listed on this page may be incorrect, incomplete, or outdated. We strongly recommend verifying all licensing information against the latest official Microsoft licensing documentation before making any purchasing or deployment decisions.": "Los requisitos de licencia y la disponibilidad de funciones indicados en esta página pueden ser incorrectos, incompletos o estar desactualizados. Verifique toda la información de licencias en la documentación oficial más reciente de Microsoft antes de tomar decisiones de compra o implementación.",
    "Full coverage is included with this plan.": "Este plan incluye cobertura completa.",
    "Full Cloud apps coverage is included with this plan.": "Este plan incluye cobertura completa de aplicaciones en la nube.",
    "No additional server licensing note for this plan.": "Este plan no requiere notas adicionales de licencias de servidor.",
    "Server requirements apply to users or devices covered by each matching plan.": "Los requisitos de servidor se aplican a los usuarios o dispositivos cubiertos por cada plan correspondiente.",
    "This baseline delivers a hardened Windows 11 configuration that minimizes the risk of unauthorized third-party AI access while maintaining a productive user experience": "Esta línea base proporciona una configuración reforzada de Windows 11 que reduce el riesgo de acceso no autorizado de IA de terceros y mantiene la productividad.",
    "This baseline delivers a hardened MacOS configuration that minimizes the risk of unauthorized third-party AI access while maintaining a productive user experience,": "Esta línea base proporciona una configuración reforzada de macOS que reduce el riesgo de acceso no autorizado de IA de terceros y mantiene la productividad.",
    "Windows 11 policy templates for protecting AI agent operating environments.": "Plantillas de directivas de Windows 11 para proteger entornos operativos de agentes de IA.",
    "Conditional Access policy templates for protecting AI agent access.": "Plantillas de directivas de acceso condicional para proteger el acceso de agentes de IA.",
    "All policies belonging to Windows": "Todas las directivas de Windows",
    "No repository description is currently provided in GitHub About.": "GitHub About no proporciona actualmente una descripción del repositorio.",
    "A collection of Microsoft Security Windows Server policies to help organizations accelerate secure deployments to servers with Defender for Servers (Defender for Cloud), Defender Business for Servers and Endpoint for Servers with Intune.": "Colección de directivas de Microsoft Security para Windows Server que facilita implementaciones seguras con Defender for Servers (Defender for Cloud), Defender for Business para servidores y Endpoint for Servers con Intune.",
    "A collection of Microsoft Security Linux Server and Desktop policies to help organizations accelerate secure deployments to servers with Defender for Endpoint, Defender for Servers (Defender for Cloud), Defender Business for Servers and Endpoint for Servers with Intune.": "Colección de directivas de Microsoft Security para Linux Server y Desktop que facilita implementaciones seguras con Defender for Endpoint, Defender for Servers (Defender for Cloud), Defender for Business para servidores y Endpoint for Servers con Intune.",
    "A collection of Microsoft Security MacOS policy to help organizations automate onboarding/offboarding of Macbook's to/from Defender with Intune, accelerate secure deployments and implement Microsoft Security best practices with Zero trust principles.": "Colección de directivas de Microsoft Security para macOS que automatiza la incorporación y retirada de MacBook de Defender con Intune, agiliza implementaciones seguras y aplica prácticas recomendadas de Microsoft Security y Zero Trust.",
    "Collection of Microsoft Security policy templates for iOS and iPadOS devices, covering both BYOD (Bring Your Own Device) and corporate-managed deployments.": "Colección de plantillas de directivas de Microsoft Security para dispositivos iOS y iPadOS, para implementaciones BYOD y dispositivos administrados por la organización.",
    "All about managing android": "Todo sobre la administración de Android",
    "A collection of Microsoft Entra Conditional Access policy templates, named locations, security groups and authentication context designed to help organizations accelerate secure deployments and implement Microsoft Security best practices with Zero trust principles.": "Colección de plantillas de directivas de acceso condicional de Microsoft Entra, ubicaciones con nombre, grupos de seguridad y contextos de autenticación para agilizar implementaciones seguras y aplicar prácticas recomendadas de Microsoft Security y Zero Trust.",
  },
};

const goalTranslations: Record<ExistingLocale, Record<string, string>> = {
  de: {
    "Attack protection": "Schutz vor Angriffen",
    "Find policy templates that help protect against common identity and device attacks.": "Sicherheitsrichtlinienvorlagen zum Schutz vor häufigen Identitäts- und Geräteangriffen.",
    "Which attacks are you trying to protect against?": "Vor welchen Angriffen möchten Sie sich schützen?",
    "Device code phishing attacks": "Phishing-Angriffe mit Gerätecode",
    "Protect sign-in flows that can be abused to trick users into authorizing an attacker’s device.": "Schützen Sie Anmeldevorgänge, mit denen Benutzer dazu verleitet werden könnten, ein Gerät eines Angreifers zu autorisieren.",
    "ClickFix attacks": "ClickFix-Angriffe",
    "Explore Windows and macOS policies that help protect against ClickFix attacks.": "Entdecken Sie Windows- und macOS-Richtlinien zum Schutz vor ClickFix-Angriffen.",
    "Ransomware attacks": "Ransomware-Angriffe",
    "Explore Windows, macOS, and Windows Server policies that help protect against ransomware.": "Entdecken Sie Windows-, macOS- und Windows-Server-Richtlinien zum Schutz vor Ransomware.",
    "Token theft attacks": "Token-Diebstahl-Angriffe",
    "Help reduce the risk of stolen authentication tokens being used to access accounts and devices.": "Verringern Sie das Risiko, dass gestohlene Authentifizierungstoken für den Zugriff auf Konten und Geräte verwendet werden.",
    "AiTM (Adversary-in-the-middle) phishing attacks": "AiTM-Phishing-Angriffe (Man-in-the-Middle)",
    "Strengthen access controls against phishing proxies that attempt to capture credentials and session tokens.": "Verstärken Sie Zugriffskontrollen gegen Phishing-Proxys, die Anmeldedaten und Sitzungstoken abfangen.",
    "Password spray attacks": "Passwort-Spray-Angriffe",
    "Apply access policies that help mitigate attempts to sign in with commonly used passwords across many accounts.": "Wenden Sie Zugriffsrichtlinien an, um Anmeldeversuche mit häufig verwendeten Passwörtern über viele Konten hinweg zu erschweren.",
    "Brute force attacks": "Brute-Force-Angriffe",
    "Use identity and server security policies to help reduce repeated password-guessing attempts.": "Verringern Sie wiederholte Passwortversuche mit Identitäts- und Serversicherheitsrichtlinien.",
    "Administrator protection": "Schutz von Administratoren",
    "Strengthen protection for administrator accounts with Conditional Access policies.": "Schützen Sie Administratorkonten mit Conditional-Access-Richtlinien.",
    "Administrator protection policies": "Richtlinien zum Schutz von Administratoren",
    "Review Conditional Access policies designed to protect administrator accounts and privileged access.": "Prüfen Sie Conditional-Access-Richtlinien zum Schutz von Administratorkonten und privilegiertem Zugriff.",
    "Endpoint protection": "Endpunktschutz",
    "Explore endpoint security policies for the devices and operating systems you manage.": "Entdecken Sie Endpunktsicherheitsrichtlinien für Ihre verwalteten Geräte und Betriebssysteme.",
    "Which endpoint platforms do you need to protect?": "Welche Endgeräteplattformen möchten Sie schützen?",
    "Windows endpoint policies.": "Windows-Endpunktrichtlinien.",
    "macOS endpoint policies.": "macOS-Endpunktrichtlinien.",
    "Windows Server security policies.": "Windows-Server-Sicherheitsrichtlinien.",
    "Linux Server security policies.": "Linux-Server-Sicherheitsrichtlinien.",
    "Linux Desktop security policies.": "Linux-Desktop-Sicherheitsrichtlinien.",
    "iOS and iPadOS endpoint policies.": "iOS- und iPadOS-Endpunktrichtlinien.",
    "Android endpoint policies.": "Android-Endpunktrichtlinien.",
    "AI and Agent Security": "KI- und Agentensicherheit",
    "Explore available security policies for AI environments and AI agents.": "Entdecken Sie verfügbare Sicherheitsrichtlinien für KI-Umgebungen und KI-Agenten.",
    "Which AI and agent security templates do you want to explore?": "Welche Vorlagen für KI- und Agentensicherheit möchten Sie entdecken?",
    "AI Security": "KI-Sicherheit",
    "AI Security Windows 11": "KI-Sicherheit Windows 11",
    "AI Security macOS": "KI-Sicherheit macOS",
    "Explore available AI Security policies for Windows 11 and macOS.": "Entdecken Sie verfügbare KI-Sicherheitsrichtlinien für Windows 11 und macOS.",
    "Agent Security": "Agentensicherheit",
    "Explore Conditional Access and AI Security policies for Agent Security.": "Entdecken Sie Conditional-Access- und KI-Sicherheitsrichtlinien für Agenten.",
    "Data Security": "Datensicherheit",
    "Explore Microsoft Purview policies for protecting organizational data.": "Entdecken Sie Microsoft-Purview-Richtlinien zum Schutz von Unternehmensdaten.",
    "Choose the Data Security policy categories to explore.": "Wählen Sie die Datensicherheits-Richtlinienkategorien aus.",
    "Sensitivity labels": "Vertraulichkeitsbezeichnungen",
    "Explore policies for classifying and protecting sensitive information.": "Entdecken Sie Richtlinien zum Klassifizieren und Schützen vertraulicher Informationen.",
    "Data Loss Prevention (DLP)": "Verhinderung von Datenverlust (DLP)",
    "Explore policies that help prevent sensitive data from being shared inappropriately.": "Entdecken Sie Richtlinien, die die unsachgemäße Freigabe vertraulicher Daten verhindern.",
    "Endpoint Data Loss Prevention (eDLP)": "Endpunkt-Datenverlustprävention (eDLP)",
    "Explore policies that help protect sensitive data on endpoints.": "Entdecken Sie Richtlinien zum Schutz vertraulicher Daten auf Endpunkten.",
    "Retention": "Aufbewahrung",
    "Explore policies for retaining and deleting organizational data.": "Entdecken Sie Richtlinien zum Aufbewahren und Löschen von Unternehmensdaten.",
    "Auto labelling": "Automatische Bezeichnung",
    "Explore policies that automatically apply sensitivity labels to content.": "Entdecken Sie Richtlinien, die Inhalte automatisch mit Vertraulichkeitsbezeichnungen versehen.",
    "Sensitive Information Types (SITs)": "Vertrauliche Informationstypen (SITs)",
    "Explore policies that identify sensitive information in your organization.": "Entdecken Sie Richtlinien zum Erkennen vertraulicher Informationen in Ihrer Organisation.",
    "App protection": "App-Schutz",
    "Find policies for the types of apps your customer uses.": "Finden Sie Richtlinien für die von Ihrem Kunden eingesetzten Apps.",
    "Which types of apps do you want to protect?": "Welche eingesetzten Apps möchten Sie schützen?",
    "OAuth apps": "OAuth-Apps",
    "Explore Conditional Access policies for OAuth app protection.": "Entdecken Sie Conditional-Access-Richtlinien zum Schutz von OAuth-Apps.",
    "Desktop apps": "Desktop-Apps",
    "Explore policies for Windows and macOS desktop apps.": "Entdecken Sie Richtlinien für Windows- und macOS-Desktop-Apps.",
    "Mobile apps": "Mobile Apps",
    "Explore policies for iOS/iPadOS and Android apps.": "Entdecken Sie Richtlinien für iOS-/iPadOS- und Android-Apps.",
    "Cloud apps": "Cloud-Apps",
    "Explore policies for Windows, Windows Server, macOS, and Conditional Access.": "Entdecken Sie Richtlinien für Windows, Windows Server, macOS und Conditional Access.",
  },
  fr: {
    "Attack protection": "Protection contre les attaques",
    "Find policy templates that help protect against common identity and device attacks.": "Trouvez des modèles de stratégie pour vous protéger contre les attaques courantes visant les identités et les appareils.",
    "Which attacks are you trying to protect against?": "Contre quelles attaques souhaitez-vous vous protéger ?",
    "Device code phishing attacks": "Hameçonnage par code d’appareil",
    "Protect sign-in flows that can be abused to trick users into authorizing an attacker’s device.": "Protégez les processus de connexion pouvant être détournés pour inciter les utilisateurs à autoriser l’appareil d’un attaquant.",
    "ClickFix attacks": "Attaques ClickFix",
    "Explore Windows and macOS policies that help protect against ClickFix attacks.": "Découvrez les stratégies Windows et macOS qui contribuent à vous protéger contre les attaques ClickFix.",
    "Ransomware attacks": "Attaques par rançongiciel",
    "Explore Windows, macOS, and Windows Server policies that help protect against ransomware.": "Découvrez les stratégies Windows, macOS et Windows Server qui contribuent à vous protéger contre les rançongiciels.",
    "Token theft attacks": "Vol de jetons",
    "Help reduce the risk of stolen authentication tokens being used to access accounts and devices.": "Réduisez le risque que des jetons d’authentification volés servent à accéder à des comptes et appareils.",
    "AiTM (Adversary-in-the-middle) phishing attacks": "Hameçonnage AiTM (adversaire au milieu)",
    "Strengthen access controls against phishing proxies that attempt to capture credentials and session tokens.": "Renforcez les contrôles d’accès contre les proxys d’hameçonnage qui tentent de capturer des identifiants et des jetons de session.",
    "Password spray attacks": "Attaques par pulvérisation de mots de passe",
    "Apply access policies that help mitigate attempts to sign in with commonly used passwords across many accounts.": "Appliquez des stratégies d’accès pour limiter les tentatives de connexion utilisant des mots de passe courants sur de nombreux comptes.",
    "Brute force attacks": "Attaques par force brute",
    "Use identity and server security policies to help reduce repeated password-guessing attempts.": "Utilisez des stratégies de sécurité des identités et des serveurs pour réduire les tentatives répétées de deviner les mots de passe.",
    "Administrator protection": "Protection des administrateurs",
    "Strengthen protection for administrator accounts with Conditional Access policies.": "Renforcez la protection des comptes administrateur avec les stratégies d’accès conditionnel.",
    "Administrator protection policies": "Stratégies de protection des administrateurs",
    "Review Conditional Access policies designed to protect administrator accounts and privileged access.": "Examinez les stratégies d’accès conditionnel conçues pour protéger les comptes administrateur et les accès privilégiés.",
    "Endpoint protection": "Protection des terminaux",
    "Explore endpoint security policies for the devices and operating systems you manage.": "Découvrez les stratégies de sécurité des terminaux pour les appareils et systèmes d’exploitation que vous gérez.",
    "Which endpoint platforms do you need to protect?": "Quelles plateformes de terminaux souhaitez-vous protéger ?",
    "Windows endpoint policies.": "Stratégies de terminaux Windows.",
    "macOS endpoint policies.": "Stratégies de terminaux macOS.",
    "Windows Server security policies.": "Stratégies de sécurité Windows Server.",
    "Linux Server security policies.": "Stratégies de sécurité Linux Server.",
    "Linux Desktop security policies.": "Stratégies de sécurité Linux Desktop.",
    "iOS and iPadOS endpoint policies.": "Stratégies de terminaux iOS et iPadOS.",
    "Android endpoint policies.": "Stratégies de terminaux Android.",
    "AI and Agent Security": "Sécurité de l’IA et des agents",
    "Explore available security policies for AI environments and AI agents.": "Découvrez les stratégies de sécurité disponibles pour les environnements et agents d’IA.",
    "Which AI and agent security templates do you want to explore?": "Quels modèles de sécurité de l’IA et des agents souhaitez-vous découvrir ?",
    "AI Security": "Sécurité de l’IA",
    "Explore available AI Security policies for Windows 11 and macOS.": "Découvrez les stratégies de sécurité de l’IA disponibles pour Windows 11 et macOS.",
    "Agent Security": "Sécurité des agents",
    "Explore Conditional Access and AI Security policies for Agent Security.": "Découvrez les stratégies d’accès conditionnel et de sécurité de l’IA pour les agents.",
    "Data Security": "Sécurité des données",
    "Explore Microsoft Purview policies for protecting organizational data.": "Découvrez les stratégies Microsoft Purview de protection des données de l’organisation.",
    "Choose the Data Security policy categories to explore.": "Choisissez les catégories de stratégies de sécurité des données à découvrir.",
    "Sensitivity labels": "Étiquettes de confidentialité",
    "Explore policies for classifying and protecting sensitive information.": "Découvrez les stratégies de classification et de protection des informations sensibles.",
    "Data Loss Prevention (DLP)": "Protection contre la perte de données (DLP)",
    "Explore policies that help prevent sensitive data from being shared inappropriately.": "Découvrez les stratégies qui contribuent à empêcher le partage inapproprié de données sensibles.",
    "Endpoint Data Loss Prevention (eDLP)": "Protection contre la perte de données sur les terminaux (eDLP)",
    "Explore policies that help protect sensitive data on endpoints.": "Découvrez les stratégies de protection des données sensibles sur les terminaux.",
    "Retention": "Rétention",
    "Explore policies for retaining and deleting organizational data.": "Découvrez les stratégies de conservation et de suppression des données de l’organisation.",
    "Auto labelling": "Étiquetage automatique",
    "Explore policies that automatically apply sensitivity labels to content.": "Découvrez les stratégies qui appliquent automatiquement des étiquettes de confidentialité au contenu.",
    "Sensitive Information Types (SITs)": "Types d’informations sensibles (SIT)",
    "Explore policies that identify sensitive information in your organization.": "Découvrez les stratégies qui identifient les informations sensibles de votre organisation.",
    "App protection": "Protection des applications",
    "Find policies for the types of apps your customer uses.": "Trouvez des stratégies adaptées aux types d’applications utilisés par votre client.",
    "Which types of apps do you want to protect?": "Quels types d’applications souhaitez-vous protéger ?",
    "OAuth apps": "Applications OAuth",
    "Explore Conditional Access policies for OAuth app protection.": "Découvrez les stratégies d’accès conditionnel pour protéger les applications OAuth.",
    "Desktop apps": "Applications de bureau",
    "Explore policies for Windows and macOS desktop apps.": "Découvrez les stratégies pour les applications de bureau Windows et macOS.",
    "Mobile apps": "Applications mobiles",
    "Explore policies for iOS/iPadOS and Android apps.": "Découvrez les stratégies pour les applications iOS/iPadOS et Android.",
    "Cloud apps": "Applications cloud",
    "Explore policies for Windows, Windows Server, macOS, and Conditional Access.": "Découvrez les stratégies pour Windows, Windows Server, macOS et l’accès conditionnel.",
  },
  es: {
    "Attack protection": "Protección contra ataques",
    "Find policy templates that help protect against common identity and device attacks.": "Encuentre plantillas de directivas que ayudan a protegerse contra ataques comunes a identidades y dispositivos.",
    "Which attacks are you trying to protect against?": "¿Contra qué ataques quiere protegerse?",
    "Device code phishing attacks": "Ataques de suplantación con código de dispositivo",
    "Protect sign-in flows that can be abused to trick users into authorizing an attacker’s device.": "Proteja los flujos de inicio de sesión que pueden usarse para engañar a los usuarios y autorizar el dispositivo de un atacante.",
    "ClickFix attacks": "Ataques ClickFix",
    "Explore Windows and macOS policies that help protect against ClickFix attacks.": "Explore directivas de Windows y macOS que ayudan a protegerse contra ataques ClickFix.",
    "Ransomware attacks": "Ataques de ransomware",
    "Explore Windows, macOS, and Windows Server policies that help protect against ransomware.": "Explore directivas de Windows, macOS y Windows Server que ayudan a protegerse contra ransomware.",
    "Token theft attacks": "Ataques de robo de tokens",
    "Help reduce the risk of stolen authentication tokens being used to access accounts and devices.": "Ayude a reducir el riesgo de que se usen tokens de autenticación robados para acceder a cuentas y dispositivos.",
    "AiTM (Adversary-in-the-middle) phishing attacks": "Ataques de suplantación AiTM (adversario en el medio)",
    "Strengthen access controls against phishing proxies that attempt to capture credentials and session tokens.": "Refuerce los controles de acceso contra proxies de suplantación que intentan capturar credenciales y tokens de sesión.",
    "Password spray attacks": "Ataques de difusión de contraseñas",
    "Apply access policies that help mitigate attempts to sign in with commonly used passwords across many accounts.": "Aplique directivas de acceso para mitigar intentos de inicio de sesión con contraseñas comunes en muchas cuentas.",
    "Brute force attacks": "Ataques por fuerza bruta",
    "Use identity and server security policies to help reduce repeated password-guessing attempts.": "Use directivas de seguridad de identidades y servidores para reducir los intentos repetidos de adivinar contraseñas.",
    "Administrator protection": "Protección de administradores",
    "Strengthen protection for administrator accounts with Conditional Access policies.": "Refuerce la protección de las cuentas de administrador con directivas de acceso condicional.",
    "Administrator protection policies": "Directivas de protección de administradores",
    "Review Conditional Access policies designed to protect administrator accounts and privileged access.": "Revise las directivas de acceso condicional diseñadas para proteger cuentas de administrador y el acceso con privilegios.",
    "Endpoint protection": "Protección de puntos de conexión",
    "Explore endpoint security policies for the devices and operating systems you manage.": "Explore directivas de seguridad para los dispositivos y sistemas operativos que administra.",
    "Which endpoint platforms do you need to protect?": "¿Qué plataformas de puntos de conexión necesita proteger?",
    "Windows endpoint policies.": "Directivas para puntos de conexión Windows.",
    "macOS endpoint policies.": "Directivas para puntos de conexión macOS.",
    "Windows Server security policies.": "Directivas de seguridad de Windows Server.",
    "Linux Server security policies.": "Directivas de seguridad de Linux Server.",
    "Linux Desktop security policies.": "Directivas de seguridad de Linux Desktop.",
    "iOS and iPadOS endpoint policies.": "Directivas para puntos de conexión iOS y iPadOS.",
    "Android endpoint policies.": "Directivas para puntos de conexión Android.",
    "AI and Agent Security": "Seguridad de IA y agentes",
    "Explore available security policies for AI environments and AI agents.": "Explore las directivas de seguridad disponibles para entornos y agentes de IA.",
    "Which AI and agent security templates do you want to explore?": "¿Qué plantillas de seguridad de IA y agentes quiere explorar?",
    "AI Security": "Seguridad de IA",
    "Explore available AI Security policies for Windows 11 and macOS.": "Explore las directivas disponibles de seguridad de IA para Windows 11 y macOS.",
    "Agent Security": "Seguridad de agentes",
    "Explore Conditional Access and AI Security policies for Agent Security.": "Explore directivas de acceso condicional y seguridad de IA para agentes.",
    "Data Security": "Seguridad de datos",
    "Explore Microsoft Purview policies for protecting organizational data.": "Explore las directivas de Microsoft Purview para proteger los datos de la organización.",
    "Choose the Data Security policy categories to explore.": "Elija las categorías de directivas de seguridad de datos que quiere explorar.",
    "Sensitivity labels": "Etiquetas de confidencialidad",
    "Explore policies for classifying and protecting sensitive information.": "Explore directivas para clasificar y proteger información confidencial.",
    "Data Loss Prevention (DLP)": "Prevención de pérdida de datos (DLP)",
    "Explore policies that help prevent sensitive data from being shared inappropriately.": "Explore directivas que ayudan a impedir el uso compartido inadecuado de datos confidenciales.",
    "Endpoint Data Loss Prevention (eDLP)": "Prevención de pérdida de datos en puntos de conexión (eDLP)",
    "Explore policies that help protect sensitive data on endpoints.": "Explore directivas que ayudan a proteger datos confidenciales en puntos de conexión.",
    "Retention": "Retención",
    "Explore policies for retaining and deleting organizational data.": "Explore directivas para conservar y eliminar datos de la organización.",
    "Auto labelling": "Etiquetado automático",
    "Explore policies that automatically apply sensitivity labels to content.": "Explore directivas que aplican automáticamente etiquetas de confidencialidad al contenido.",
    "Sensitive Information Types (SITs)": "Tipos de información confidencial (SIT)",
    "Explore policies that identify sensitive information in your organization.": "Explore directivas que identifican información confidencial en su organización.",
    "App protection": "Protección de aplicaciones",
    "Find policies for the types of apps your customer uses.": "Encuentre directivas para los tipos de aplicaciones que usa su cliente.",
    "Which types of apps do you want to protect?": "¿Qué tipos de aplicaciones quiere proteger?",
    "OAuth apps": "Aplicaciones OAuth",
    "Explore Conditional Access policies for OAuth app protection.": "Explore directivas de acceso condicional para proteger aplicaciones OAuth.",
    "Desktop apps": "Aplicaciones de escritorio",
    "Explore policies for Windows and macOS desktop apps.": "Explore directivas para aplicaciones de escritorio Windows y macOS.",
    "Mobile apps": "Aplicaciones móviles",
    "Explore policies for iOS/iPadOS and Android apps.": "Explore directivas para aplicaciones iOS/iPadOS y Android.",
    "Cloud apps": "Aplicaciones en la nube",
    "Explore policies for Windows, Windows Server, macOS, and Conditional Access.": "Explore directivas para Windows, Windows Server, macOS y acceso condicional.",
  },
};

const productNameTranslations: Record<ExistingLocale, Record<string, string>> = {
  de: { "Linux Desktop": "Linux-Desktop", "Linux Server": "Linux-Server", "Windows Servers": "Windows-Server", Purview: "Purview" },
  fr: { "Linux Desktop": "Linux Desktop", "Linux Server": "Linux Server", "Windows Servers": "Windows Server", Purview: "Purview" },
  es: { "Linux Desktop": "Linux Desktop", "Linux Server": "Linux Server", "Windows Servers": "Windows Server", Purview: "Purview" },
};

export const coreTranslationKeys = [
  ...Object.keys(translations.de),
  ...Object.keys(goalTranslations.de),
  ...Object.keys(productNameTranslations.de),
];

export function translate(locale: Locale, text: string): string {
  if (locale === "en") return text;
  if (locale === "pl") return translatePolish(text);
  if (locale === "ru" || locale === "it") return translateNewLocale(locale, text);
  const trimmed = text.trim();
  if (trimmed && trimmed !== text) {
    return text.slice(0, text.indexOf(trimmed)) + translate(locale, trimmed) +
      text.slice(text.indexOf(trimmed) + trimmed.length);
  }
  const exact = translations[locale][text] ?? goalTranslations[locale][text] ?? productNameTranslations[locale][text];
  if (exact) return exact;

  const dynamic = translateDynamic(locale, text);
  if (dynamic !== undefined) return dynamic;

  const additional = translateAdditional(locale, text, part => translate(locale, part));
  if (additional !== undefined) return additional;

  return localizePlanCounts(
    locale,
    text.replace(/\{(count|seats|name)\}/g, (_match, key: string) => `{${key}}`),
  );
}

export function translateFormat(
  locale: Locale,
  template: string,
  values: Record<string, string | number>,
): string {
  if (locale === "pl" && template.startsWith("Continue with {count} license plan")) {
    return formatPolishLicenseContinue(Number(values.count ?? 0), Number(values.seats ?? 0));
  }
  return translate(locale, template).replace(/\{(count|seats|name)\}/g, (_match, key: string) =>
    String(values[key] ?? ""),
  );
}

export function getLocaleFromPath(pathname: string, baseUrl: string): Locale {
  const relativePath = pathname.startsWith(baseUrl)
    ? pathname.slice(baseUrl.length)
    : pathname.replace(/^\/+/, "");
  const firstSegment = relativePath.split("/")[0]?.toLowerCase();
  return firstSegment === "de" || firstSegment === "fr" || firstSegment === "es" ||
    firstSegment === "ru" || firstSegment === "it" || firstSegment === "pl"
    ? firstSegment
    : "en";
}

export function getLocalePath(locale: Locale, baseUrl: string): string {
  return locale === "en" ? baseUrl : `${baseUrl}${locale}`;
}

function localizePlanCounts(locale: Locale, value: string): string {
  const unit = locale === "de"
    ? (count: number) => count === 1 ? "Lizenz" : "Lizenzen"
    : locale === "fr"
      ? (count: number) => count === 1 ? "licence" : "licences"
      : locale === "es"
        ? (count: number) => count === 1 ? "licencia" : "licencias"
        : locale === "ru"
          ? (count: number) => count === 1 ? "лицензия" : count >= 2 && count <= 4 ? "лицензии" : "лицензий"
          : (count: number) => count === 1 ? "licenza" : "licenze";
  return value.replace(/(\d+) (Microsoft 365 [^;:]+?) licenses?/g, (_match, countText: string, name: string) =>
    `${countText} ${name} ${unit(Number(countText))}`,
  );
}

function translateDynamic(locale: ExistingLocale, text: string): string | undefined {
  const exactTitles: Record<string, string> = locale === "de"
    ? {
      "Limited Conditional Access experience": "Eingeschränkter Funktionsumfang für Conditional Access",
      "Agent 365 license required for full Conditional Access experience": "Agent-365-Lizenz für den vollen Funktionsumfang von Conditional Access erforderlich",
      "Agent 365 license required for full AI Security experience": "Agent-365-Lizenz für den vollen KI-Sicherheitsfunktionsumfang erforderlich",
      "Limited Agent Security experience": "Eingeschränkter Funktionsumfang für Agentensicherheit",
      "Agent 365 license required for full Agent Security experience": "Agent-365-Lizenz für den vollen Funktionsumfang der Agentensicherheit erforderlich",
      "Limited Microsoft Purview experience": "Eingeschränkter Microsoft-Purview-Funktionsumfang",
      "Microsoft Defender Suite required for full Conditional Access experience": "Microsoft Defender Suite für den vollen Funktionsumfang von Conditional Access erforderlich",
    }
    : locale === "fr"
      ? {
        "Limited Conditional Access experience": "Expérience limitée de l’accès conditionnel",
        "Agent 365 license required for full Conditional Access experience": "Licence Agent 365 requise pour l’expérience complète d’accès conditionnel",
        "Agent 365 license required for full AI Security experience": "Licence Agent 365 requise pour l’expérience complète de sécurité de l’IA",
        "Limited Agent Security experience": "Expérience limitée de sécurité des agents",
        "Agent 365 license required for full Agent Security experience": "Licence Agent 365 requise pour l’expérience complète de sécurité des agents",
        "Limited Microsoft Purview experience": "Expérience Microsoft Purview limitée",
        "Microsoft Defender Suite required for full Conditional Access experience": "Microsoft Defender Suite est requis pour l’expérience complète d’accès conditionnel",
      }
      : {
        "Limited Conditional Access experience": "Experiencia limitada de acceso condicional",
        "Agent 365 license required for full Conditional Access experience": "Se requiere una licencia de Agent 365 para la experiencia completa de acceso condicional",
        "Agent 365 license required for full AI Security experience": "Se requiere una licencia de Agent 365 para la experiencia completa de seguridad de IA",
        "Limited Agent Security experience": "Experiencia limitada de seguridad de agentes",
        "Agent 365 license required for full Agent Security experience": "Se requiere una licencia de Agent 365 para la experiencia completa de seguridad de agentes",
        "Limited Microsoft Purview experience": "Experiencia limitada de Microsoft Purview",
        "Microsoft Defender Suite required for full Conditional Access experience": "Se requiere Microsoft Defender Suite para la experiencia completa de acceso condicional",
      };
  if (exactTitles[text]) return exactTitles[text];

  const mixMessage = text.match(/^Selected plan mix: (.*)\. Entitlements apply only to users assigned each matching plan; the counts do not indicate whether the same users hold multiple plans\. (.*)$/);
  if (mixMessage) {
    const intro = locale === "de"
      ? "Die ausgewählten Lizenzpläne gelten nur für Benutzer mit dem jeweiligen Plan. Die Anzahlen zeigen nicht, ob dieselben Personen mehrere Pläne besitzen."
      : locale === "fr"
        ? "Les droits s’appliquent uniquement aux utilisateurs de chaque offre. Le nombre de licences n’indique pas si les mêmes personnes disposent de plusieurs offres."
        : "Los derechos se aplican solo a los usuarios de cada plan. El recuento no indica si las mismas personas tienen varios planes.";
    const details = mixMessage[2].replace(
      /(\d+) (Microsoft 365 .*?) licenses?: (.*?)(?= \d+ Microsoft 365 |$)/g,
      (_match, count: string, name: string, note: string) =>
        `${count} ${name} ${Number(count) === 1 ? (locale === "de" ? "Lizenz" : locale === "fr" ? "licence" : "licencia") : (locale === "de" ? "Lizenzen" : locale === "fr" ? "licences" : "licencias")}: ${translate(locale, note)}`,
    );
    return `${locale === "de" ? "Ausgewählte Lizenzpläne" : locale === "fr" ? "Offres sélectionnées" : "Planes seleccionados"}: ${localizePlanCounts(locale, mixMessage[1])}. ${intro} ${details}`;
  }

  const mixedTitle = text.match(/^Mixed (.+) license experience$/);
  if (mixedTitle) {
    const platform = translate(locale, mixedTitle[1]);
    return locale === "de" ? "Eingeschränkter Lizenzumfang für " + platform
      : locale === "fr" ? "Expérience de licence mixte pour " + platform
        : "Experiencia de licencia mixta para " + platform;
  }

  const limitedTitle = text.match(/^Limited (.+) experience$/);
  if (limitedTitle) {
    return `${locale === "de" ? "Eingeschränkter Funktionsumfang für " : locale === "fr" ? "Expérience limitée pour " : "Experiencia limitada de "}${translate(locale, limitedTitle[1])}`;
  }

  const agentTitle = text.match(/^Agent 365 license required for full (.+) experience$/);
  if (agentTitle) {
    const subject = locale === "de" ? translate(locale, agentTitle[1]) : agentTitle[1];
    return locale === "de" ? `Agent-365-Lizenz für den vollen Funktionsumfang von ${subject} erforderlich`
      : locale === "fr" ? `Licence Agent 365 requise pour l’expérience complète de ${subject}`
        : `Se requiere una licencia de Agent 365 para la experiencia completa de ${subject}`;
  }

  const mixPrefix = text.match(/^Selected plan mix: (.*)\. Server requirements apply to users or devices covered by each matching plan\. (.*)$/);
  if (mixPrefix) {
    const start = locale === "de" ? "Ausgewählte Lizenzpläne: " : locale === "fr" ? "Offres sélectionnées : " : "Planes seleccionados: ";
    const requirements = locale === "de"
      ? "Die Serveranforderungen gelten für Benutzer oder Geräte, die durch den jeweiligen Plan abgedeckt sind."
      : locale === "fr"
        ? "Les exigences serveur s’appliquent aux utilisateurs ou appareils couverts par chaque offre correspondante."
        : "Los requisitos de servidor se aplican a los usuarios o dispositivos cubiertos por cada plan correspondiente.";
    return `${start}${localizePlanCounts(locale, mixPrefix[1])}. ${requirements} ${translate(locale, mixPrefix[2])}`;
  }

  const serverNote = text.match(/^Limited Windows Server experience: (.*)$/);
  if (serverNote) {
    const localized = locale === "de"
      ? "Eingeschränkter Windows-Server-Funktionsumfang: Microsoft 365 F1 oder F3 mit Defender Suite enthält keine Serverlizenzierung. Erwerben Sie vor der Bereitstellung dieser Richtlinien entweder Microsoft Defender for Servers Plan 1 oder Plan 2 über Microsoft Defender for Cloud oder eine Microsoft Defender for Endpoint Server-Lizenz pro Server."
      : locale === "fr"
        ? "Expérience Windows Server limitée : Microsoft 365 F1 ou F3 avec Defender Suite n’inclut pas de licence serveur. Avant le déploiement, achetez Microsoft Defender for Servers Plan 1 ou 2 via Microsoft Defender for Cloud, ou une licence Microsoft Defender for Endpoint Server par serveur."
        : "Experiencia limitada de Windows Server: Microsoft 365 F1 o F3 con Defender Suite no incluye licencias de servidor. Antes de implementar estas directivas, compre Microsoft Defender for Servers Plan 1 o Plan 2 a través de Microsoft Defender for Cloud, o una licencia de Microsoft Defender for Endpoint Server para cada servidor.";
    return localized;
  }

  const withNames = text.match(/^With (.*?), (.*)$/);
  if (withNames) {
    const opening = locale === "de" ? `Mit ${withNames[1]} ` : locale === "fr" ? `Avec ${withNames[1]}, ` : `Con ${withNames[1]}, `;
    const source = withNames[2];
    const entries: Record<ExistingLocale, Array<[RegExp, string]>> = {
      de: [
        [/^add Microsoft Entra ID Plan 2 for risky user and risky sign-in policy templates\. Microsoft Entra ID Plan 2 is also included with the Microsoft Defender Suite( FLW)? add-on\.( An Agent 365 license is required for all Agent 365 policy templates; Agent 365 is also included in Microsoft 365 E7\.)?$/, "fügen Sie Microsoft Entra ID Plan 2 für Vorlagen zu riskanten Benutzern und Anmeldungen hinzu. Microsoft Entra ID Plan 2 ist auch im Add-on Microsoft Defender Suite$1 enthalten.$2"],
        [/^add an Agent 365 license to unlock the full Conditional Access policy-template experience\. Agent 365 is also included in Microsoft 365 E7\.$/, "fügen Sie eine Agent-365-Lizenz hinzu, um den vollen Funktionsumfang der Conditional-Access-Richtlinienvorlagen freizuschalten. Agent 365 ist auch in Microsoft 365 E7 enthalten."],
        [/^add an Agent 365 license to unlock the full (.+) policy-template experience\. Agent 365 is also included in Microsoft 365 E7\.$/, "fügen Sie eine Agent-365-Lizenz hinzu, um den vollen Funktionsumfang der Vorlagen für $1 freizuschalten. Agent 365 ist auch in Microsoft 365 E7 enthalten."],
        [/^add the Microsoft Defender Suite( FLW)? add-on and an Agent 365 license to unlock the full (.+) policy-template experience\. Agent 365 is also included in Microsoft 365 E7\.$/, "fügen Sie das Add-on Microsoft Defender Suite$1 und eine Agent-365-Lizenz hinzu, um den vollen Funktionsumfang der Vorlagen für $2 freizuschalten. Agent 365 ist auch in Microsoft 365 E7 enthalten."],
        [/^add the Microsoft Defender Suite( FLW)? add-on to unlock the full (.+) policy-template experience\.$/, "fügen Sie das Add-on Microsoft Defender Suite$1 hinzu, um den vollen Funktionsumfang der Vorlagen für $2 freizuschalten."],
        [/^add Microsoft Defender Suite( FLW)? to one of your selected qualifying base licenses, or purchase Microsoft Defender for Endpoint Plan 2, to unlock the full Linux Desktop policy-template experience\.$/, "fügen Sie Microsoft Defender Suite$1 zu einer ausgewählten qualifizierenden Basislizenz hinzu oder erwerben Sie Microsoft Defender for Endpoint Plan 2, um den vollen Funktionsumfang der Linux-Desktop-Richtlinienvorlagen freizuschalten."],
        [/^Microsoft Purview Suite FLW supports Data Security with limitations; e-DLP policies are excluded\.$/, "Microsoft Purview Suite FLW unterstützt Datensicherheit mit Einschränkungen; e-DLP-Richtlinien sind ausgeschlossen."],
        [/^only sensitivity labels are supported\.$/, "nur Vertraulichkeitsbezeichnungen werden unterstützt."],
        [/^Data Security is supported with limitations, without full DLP experience and auto-labeling; add the Microsoft Purview Suite add-on to unlock the full Microsoft Purview policy-template experience\.$/, "Datensicherheit wird mit Einschränkungen unterstützt; der volle DLP-Funktionsumfang und die automatische Bezeichnung sind nicht enthalten. Fügen Sie das Add-on Microsoft Purview Suite hinzu, um den vollen Funktionsumfang der Microsoft-Purview-Vorlagen freizuschalten."],
        [/^add the Microsoft Purview Suite( FLW)? add-on to unlock the full Microsoft Purview policy-template experience\.$/, "fügen Sie das Add-on Microsoft Purview Suite$1 hinzu, um den vollen Funktionsumfang der Microsoft-Purview-Vorlagen freizuschalten."],
        [/^Microsoft Defender Suite add-on is required\. (.*)$/, "Das Add-on Microsoft Defender Suite ist erforderlich. $1"],
      ],
      fr: [
        [/^add Microsoft Entra ID Plan 2 for risky user and risky sign-in policy templates\. Microsoft Entra ID Plan 2 is also included with the Microsoft Defender Suite( FLW)? add-on\.( An Agent 365 license is required for all Agent 365 policy templates; Agent 365 is also included in Microsoft 365 E7\.)?$/, "ajoutez Microsoft Entra ID Plan 2 pour les modèles relatifs aux utilisateurs et connexions à risque. Microsoft Entra ID Plan 2 est également inclus dans le module complémentaire Microsoft Defender Suite$1.$2"],
        [/^add an Agent 365 license to unlock the full Conditional Access policy-template experience\. Agent 365 is also included in Microsoft 365 E7\.$/, "ajoutez une licence Agent 365 pour bénéficier de l’expérience complète des modèles d’accès conditionnel. Agent 365 est également inclus dans Microsoft 365 E7."],
        [/^add an Agent 365 license to unlock the full (.+) policy-template experience\. Agent 365 is also included in Microsoft 365 E7\.$/, "ajoutez une licence Agent 365 pour bénéficier de l’expérience complète des modèles $1. Agent 365 est également inclus dans Microsoft 365 E7."],
        [/^add the Microsoft Defender Suite( FLW)? add-on and an Agent 365 license to unlock the full (.+) policy-template experience\. Agent 365 is also included in Microsoft 365 E7\.$/, "ajoutez le module Microsoft Defender Suite$1 et une licence Agent 365 pour bénéficier de l’expérience complète des modèles $2. Agent 365 est également inclus dans Microsoft 365 E7."],
        [/^add the Microsoft Defender Suite( FLW)? add-on to unlock the full (.+) policy-template experience\.$/, "ajoutez le module Microsoft Defender Suite$1 pour bénéficier de l’expérience complète des modèles $2."],
        [/^add Microsoft Defender Suite( FLW)? to one of your selected qualifying base licenses, or purchase Microsoft Defender for Endpoint Plan 2, to unlock the full Linux Desktop policy-template experience\.$/, "ajoutez Microsoft Defender Suite$1 à l’une de vos licences de base éligibles sélectionnées, ou achetez Microsoft Defender for Endpoint Plan 2, pour bénéficier de l’expérience complète des modèles Linux Desktop."],
        [/^Microsoft Purview Suite FLW supports Data Security with limitations; e-DLP policies are excluded\.$/, "Microsoft Purview Suite FLW prend en charge la sécurité des données avec des limitations ; les stratégies e-DLP sont exclues."],
        [/^only sensitivity labels are supported\.$/, "seules les étiquettes de confidentialité sont prises en charge."],
        [/^Data Security is supported with limitations, without full DLP experience and auto-labeling; add the Microsoft Purview Suite add-on to unlock the full Microsoft Purview policy-template experience\.$/, "la sécurité des données est prise en charge avec des limitations, sans expérience DLP complète ni étiquetage automatique ; ajoutez Microsoft Purview Suite pour bénéficier de l’expérience complète des modèles Microsoft Purview."],
        [/^add the Microsoft Purview Suite( FLW)? add-on to unlock the full Microsoft Purview policy-template experience\.$/, "ajoutez le module Microsoft Purview Suite$1 pour bénéficier de l’expérience complète des modèles Microsoft Purview."],
      ],
      es: [
        [/^add Microsoft Entra ID Plan 2 for risky user and risky sign-in policy templates\. Microsoft Entra ID Plan 2 is also included with the Microsoft Defender Suite( FLW)? add-on\.( An Agent 365 license is required for all Agent 365 policy templates; Agent 365 is also included in Microsoft 365 E7\.)?$/, "agregue Microsoft Entra ID Plan 2 para las plantillas de usuarios e inicios de sesión de riesgo. Microsoft Entra ID Plan 2 también se incluye en el complemento Microsoft Defender Suite$1.$2"],
        [/^add an Agent 365 license to unlock the full Conditional Access policy-template experience\. Agent 365 is also included in Microsoft 365 E7\.$/, "agregue una licencia de Agent 365 para desbloquear la experiencia completa de las plantillas de acceso condicional. Agent 365 también se incluye en Microsoft 365 E7."],
        [/^add an Agent 365 license to unlock the full (.+) policy-template experience\. Agent 365 is also included in Microsoft 365 E7\.$/, "agregue una licencia de Agent 365 para desbloquear la experiencia completa de las plantillas de $1. Agent 365 también se incluye en Microsoft 365 E7."],
        [/^add the Microsoft Defender Suite( FLW)? add-on and an Agent 365 license to unlock the full (.+) policy-template experience\. Agent 365 is also included in Microsoft 365 E7\.$/, "agregue el complemento Microsoft Defender Suite$1 y una licencia de Agent 365 para desbloquear la experiencia completa de las plantillas de $2. Agent 365 también se incluye en Microsoft 365 E7."],
        [/^add the Microsoft Defender Suite( FLW)? add-on to unlock the full (.+) policy-template experience\.$/, "agregue el complemento Microsoft Defender Suite$1 para desbloquear la experiencia completa de las plantillas de $2."],
        [/^add Microsoft Defender Suite( FLW)? to one of your selected qualifying base licenses, or purchase Microsoft Defender for Endpoint Plan 2, to unlock the full Linux Desktop policy-template experience\.$/, "agregue Microsoft Defender Suite$1 a una de las licencias base aptas seleccionadas o compre Microsoft Defender for Endpoint Plan 2 para desbloquear la experiencia completa de las plantillas de Linux Desktop."],
        [/^Microsoft Purview Suite FLW supports Data Security with limitations; e-DLP policies are excluded\.$/, "Microsoft Purview Suite FLW admite Seguridad de datos con limitaciones; se excluyen las directivas e-DLP."],
        [/^only sensitivity labels are supported\.$/, "solo se admiten etiquetas de confidencialidad."],
        [/^Data Security is supported with limitations, without full DLP experience and auto-labeling; add the Microsoft Purview Suite add-on to unlock the full Microsoft Purview policy-template experience\.$/, "Seguridad de datos se admite con limitaciones, sin la experiencia completa de DLP ni etiquetado automático; agregue el complemento Microsoft Purview Suite para desbloquear la experiencia completa de las plantillas de Microsoft Purview."],
        [/^add the Microsoft Purview Suite( FLW)? add-on to unlock the full Microsoft Purview policy-template experience\.$/, "agregue el complemento Microsoft Purview Suite$1 para desbloquear la experiencia completa de las plantillas de Microsoft Purview."],
      ],
    };
    for (const [pattern, replacement] of entries[locale]) {
      if (pattern.test(source)) return opening + source.replace(pattern, replacement);
    }

    return undefined;
  }
  return undefined;
}
