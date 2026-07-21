'use client';

import { HelpCircle, MessageSquare, Settings, BookOpen, Mail, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

const FAQS = [
  {
    q: 'Comment changer mon mot de passe ?',
    a: 'Rendez-vous dans Paramètres → Sécurité, saisissez votre mot de passe actuel puis le nouveau (8 caractères minimum).',
  },
  {
    q: 'Où puis-je modifier mes informations personnelles ?',
    a: 'Sur la page Profil, vous pouvez éditer votre nom, département, poste et langue, puis enregistrer.',
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
  { icon: MessageSquare, title: 'Centre de discussion', desc: 'Posez vos questions à l\u2019assistant intelligent.' },
  { icon: Settings, title: 'Configuration avancée', desc: 'Gérez rôles, départements et accès équipe.' },
];

export default function HelpPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 text-center sm:text-left">
        <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto sm:mx-0 mb-4">
          <HelpCircle className="w-7 h-7 text-primary-500" />
        </div>
        <h1 className="text-[28px] font-semibold tracking-tight text-secondary-900">Centre d&apos;aide</h1>
        <p className="text-secondary-500 mt-1.5 text-[15px]">Trouvez de l&apos;aide pour utiliser la plateforme.</p>
      </div>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Ressources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {RESOURCES.map(({ icon: Icon, title, desc }) => (
            <Card key={title} variant="hover" className="p-5 cursor-default">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-primary-500" />
              </div>
              <p className="font-medium text-secondary-900 text-sm">{title}</p>
              <p className="text-xs text-secondary-500 mt-1 leading-relaxed">{desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Questions fréquentes</h2>
        <Card>
          <CardContent className="p-2 sm:p-3 divide-y divide-secondary-200/70">
            {FAQS.map(({ q, a }) => (
              <details key={q} className="group px-3 py-1">
                <summary className="flex items-center justify-between gap-3 cursor-pointer py-3.5 text-[15px] font-medium text-secondary-900 list-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-lg">
                  {q}
                  <ChevronDown className="w-4 h-4 text-secondary-400 flex-shrink-0 transition-transform duration-200 ease-out group-open:rotate-180" />
                </summary>
                <p className="text-sm text-secondary-600 leading-relaxed pb-4 pr-6">{a}</p>
              </details>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card className="bg-gradient-to-br from-primary-50 to-white border-primary-100">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
            <Mail className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <p className="font-medium text-secondary-900">Besoin d&apos;aide supplémentaire ?</p>
            <p className="text-sm text-secondary-600 mt-0.5">
              Contactez l&apos;équipe support à{' '}
              <a
                href="mailto:support@metric-decision.com"
                className="text-primary-600 underline underline-offset-2 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
              >
                support@metric-decision.com
              </a>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
