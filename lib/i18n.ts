export type Language = 'en' | 'fr';

export const translations = {
    en: {
        sidebar: {
            dashboard: "Dashboard",
            myWork: "My Work",
            validation: "Validation",
            studio: "Studio",
            settings: "Settings",
            global: "Global Feed",
            stats: "Analytics",
            signOut: "Sign Out",
        },
        global: {
            title: "Global Contributions",
            subtitle: "Discover content created by professors worldwide.",
            createdBy: "Created by",
            view: "View"
        },
        stats: {
            title: "Analytics",
            subtitle: "Visualize your impact and content distribution.",
            distribution: "Content Distribution",
            coursesBySubject: "Courses by Subject",
            totalViews: "Total Views",
            completionRate: "Completion Rate"
        },
        dashboard: {
            welcome: "Welcome back,",
            impactDescription: "Here's what's happening in your ecosystem today.",
            stats: {
                studentsImpacted: "Students Impacted",
                contentCreated: "Content Created",
                pendingValidations: "Pending Validations",
                globalRating: "Global Rating"
            },
            quickActions: {
                title: "Quick Actions",
                createQuiz: "Create New Quiz",
                createQuizDesc: "Design interactive quizzes to test student knowledge.",
                startCreating: "Start Creating",
                validateContent: "Validate Community Data",
                validateContentDesc: "Review and verify student-submitted suggestions.",
                startReviewing: "Start Reviewing"
            },
            recentActivity: {
                title: "Recent Activity",
                newItem: "New quiz \"{item}\" published.",
                timeAgo: "{time} hours ago"
            }
        },
        validation: {
            title: "Content Validation",
            subtitle: "Review and approve contributions from fellow educators before publication.",
            stats: {
                reviewed: "Reviewed Today",
                pending: "Pending Review",
                types: "Content Types"
            },
            filters: {
                all: "All Content",
                quiz: "Quizzes",
                flashcard: "Flashcards",
                course: "Courses",
                exercise: "Exercises"
            },
            empty: {
                title: "All caught up! 🎉",
                desc: "No more items to validate for now.",
                categoryDesc: "No {category} to validate.",
                reset: "Reset Demo"
            },
            actions: {
                approve: "Approve",
                reject: "Reject"
            }
        },
        studio: {
            title: "Creation Studio",
            subtitle: "Create engaging content for your students.",
            tools: {
                quiz: {
                    title: "Quiz Creator",
                    desc: "Create multiple choice quizzes with ease."
                },
                flashcard: {
                    title: "Flashcard Set",
                    desc: "Build spaced repetition decks for memorization."
                },
                course: {
                    title: "Course Editor",
                    desc: "Write rich articles and lesson notes."
                },
                exercise: {
                    title: "Exercise Generator",
                    desc: "Generate practice problems for any topic."
                }
            }
        },
        settings: {
            title: "Settings",
            language: {
                title: "Language",
                desc: "Choose your preferred language",
                options: {
                    en: "English",
                    fr: "Français"
                }
            },
            profile: {
                title: "Profile",
                displayName: "Display Name",
                email: "Email"
            },
            notifications: {
                title: "Notifications",
                email: "Email notifications",
                validation: "Validation reminders"
            },
            appearance: {
                title: "Appearance",
                desc: "Dark mode is currently enabled (default)"
            },
            save: "Save Changes"
        },
        myWork: {
            title: "My Work",
            subtitle: "All your contributions to the Lucid ecosystem",
            stats: {
                quizzes: "Quizzes",
                flashcards: "Decks",
                courses: "Courses",
                exercises: "Exercise Sets"
            },
            actions: {
                newQuiz: "+ New Quiz",
                newDeck: "+ New Deck",
                newCourse: "+ New Course",
                newSet: "+ New Set",
                edit: "Edit",
                view: "View"
            }
        }
    },
    fr: {
        sidebar: {
            dashboard: "Tableau de bord",
            myWork: "Mon Travail",
            validation: "Validation",
            studio: "Studio",
            settings: "Paramètres",
            global: "Flux Global",
            stats: "Analytiques",
            signOut: "Déconnexion",
        },
        global: {
            title: "Contributions Globales",
            subtitle: "Découvrez le contenu créé par les professeurs du monde entier.",
            createdBy: "Créé par",
            view: "Voir"
        },
        stats: {
            title: "Analytiques",
            subtitle: "Visualisez votre impact et la distribution de votre contenu.",
            distribution: "Distribution du Contenu",
            coursesBySubject: "Cours par Sujet",
            totalViews: "Vues Totales",
            completionRate: "Taux de Complétion"
        },
        dashboard: {
            welcome: "Bon retour,",
            impactDescription: "Voici ce qui se passe dans votre écosystème aujourd'hui.",
            stats: {
                studentsImpacted: "Étudiants Impactés",
                contentCreated: "Contenus Créés",
                pendingValidations: "Validations en attente",
                globalRating: "Note Globale"
            },
            quickActions: {
                title: "Actions Rapides",
                createQuiz: "Créer un Nouveau Quiz",
                createQuizDesc: "Concevez des quiz interactifs pour tester les connaissances.",
                startCreating: "Commencer",
                validateContent: "Valider les Données",
                validateContentDesc: "Examinez et vérifiez les suggestions des étudiants.",
                startReviewing: "Commencer"
            },
            recentActivity: {
                title: "Activité Récente",
                newItem: "Le quiz \"{item}\" a été publié.",
                timeAgo: "Il y a {time} heures"
            }
        },
        validation: {
            title: "Validation de Contenu",
            subtitle: "Examinez et approuvez les contributions des autres éducateurs avant publication.",
            stats: {
                reviewed: "Revu Aujourd'hui",
                pending: "En Attente",
                types: "Types de Contenu"
            },
            filters: {
                all: "Tout",
                quiz: "Quiz",
                flashcard: "Flashcards",
                course: "Cours",
                exercise: "Exercices"
            },
            empty: {
                title: "Tout est à jour ! 🎉",
                desc: "Plus aucun élément à valider pour le moment.",
                categoryDesc: "Aucun {category} à valider.",
                reset: "Réinitialiser Démo"
            },
            actions: {
                approve: "Approuver",
                reject: "Rejeter"
            }
        },
        studio: {
            title: "Studio de Création",
            subtitle: "Créez du contenu engageant pour vos étudiants.",
            tools: {
                quiz: {
                    title: "Créateur de Quiz",
                    desc: "Créez des quiz à choix multiples facilement."
                },
                flashcard: {
                    title: "Jeu de Flashcards",
                    desc: "Créez des paquets de répétition espacée."
                },
                course: {
                    title: "Éditeur de Cours",
                    desc: "Rédigez des articles riches et des notes de cours."
                },
                exercise: {
                    title: "Générateur d'Exercices",
                    desc: "Générez des problèmes pratiques pour n'importe quel sujet."
                }
            }
        },
        settings: {
            title: "Paramètres",
            language: {
                title: "Langue",
                desc: "Choisissez votre langue préférée",
                options: {
                    en: "English",
                    fr: "Français"
                }
            },
            profile: {
                title: "Profil",
                displayName: "Nom d'affichage",
                email: "Email"
            },
            notifications: {
                title: "Notifications",
                email: "Notifications par email",
                validation: "Rappels de validation"
            },
            appearance: {
                title: "Apparence",
                desc: "Le mode sombre est activé (par défaut)"
            },
            save: "Enregistrer"
        },
        myWork: {
            title: "Mon Travail",
            subtitle: "Toutes vos contributions à l'écosystème Lucid",
            stats: {
                quizzes: "Quiz",
                flashcards: "Paquets",
                courses: "Cours",
                exercises: "Séries d'exos"
            },
            actions: {
                newQuiz: "+ Nouveau Quiz",
                newDeck: "+ Nouveau Paquet",
                newCourse: "+ Nouveau Cours",
                newSet: "+ Nouvelle Série",
                edit: "Modifier",
                view: "Voir"
            }
        }
    }
};
