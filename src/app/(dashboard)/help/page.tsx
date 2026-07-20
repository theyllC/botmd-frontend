'use client';

import { HelpCircle, MessageSquare, KeyRound, User, Settings, BookOpen, Mail } from 'lucide-react';

const FAQS = [
  {
    q: 'Comment changer mon mot de passe ?',
    a: 'Rendez-vous dans Paramètres → Sécurité, saisissez votre mot de passe actuel puis le nouveau (8 caractères minimum).',
  },
  {
    q: 'Où puis-je modifier mes informations personnelles ?',
    a: 'Sur la page Prolif, vous pouvez éditer votre nom, département, poste et langue, puis enregistrer.',
  },
  {
    q: 'Comment démarrer une nouvelle conversation ?',
    a: 'Depuis la barre latérale, cliquez sur « Chat » puis sur « Nouvelle conversation » pour lancer un assistant.',
  },
  {
    q: 'Mon compte est-il sécurisé ?',
    a: 'Vos mots de passe sont hachés côté serveur. Déconnectez-vous toujours après usage sur un poste partagé.',
  },
];

const RESOURCES = [
  { icon: BookOpen, title: 'Guide de démarrage', desc: 'Découvrez les fonctionnalités principales en 5 minutes.' },
  { icon: MessageSquare, title: 'Centre de discussion', desc: 'Posez vos questions à l’assistant intelligent.' },
  { icon: Settings, title: 'Configuration avancée', desc: 'Gérez rôles, départements et accès équipe.' },
];

export default function HelpPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-primary-600" />
          Centre d'aide
        </h1>
        <p className="text-secondary-500 mt-1">Trouvez de l'aide pour utiliser la plateforme.</p>
      </div>

      <section className="bg-white rounded-2xl border border-secondary-200 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Ressources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {RESOURCES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-4 rounded-xl border border-secondary-100 bg-secondary-50">
              <Icon className="w-6 h-6 text-primary-600 mb-2" />
              <p className="font-medium text-secondary-900 text-sm">{title}</p>
              <p className="text-xs text-secondary-500 mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-secondary-200 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Questions fréquentes</h2>
        <div className="space-y-3">
          {FAQS.map(({ q, a }) => (
            <details key={q} className="group border border-secondary-100 rounded-xl p-4 open:bg-secondary-50">
              <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-secondary-900 list-none">
                {q}
                <span className="text-secondary-400 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="text-sm text-secondary-600 mt-2 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-primary-50 border border-primary-100 rounded-2xl p-6 flex items-center gap-4">
        <Mail className="w-8 h-8 text-primary-600 shrink-0" />
        <div>
          <p className="font-medium text-secondary-900">Besoin d'aide supplémentaire ?</p>
          <p className="text-sm text-secondary-600 mt-0.5">
            Contactez l'équipe support à{' '}
            <a href="mailto:support@metric-decision.com" className="text-primary-700 underline">
              support@metric-decision.com
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
