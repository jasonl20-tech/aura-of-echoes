
import React from 'react';
import { Crown, CreditCard, Bell, Shield, Globe, Download, LogOut, ChevronRight } from 'lucide-react';

const SettingsView: React.FC = () => {
  const settingsGroups = [
    {
      title: 'Premium',
      items: [
        {
          icon: Crown,
          label: 'Abo verwalten',
          description: 'Premium Plan - 9,99€/Monat',
          action: () => alert('Abo-Verwaltung öffnen'),
          highlight: true
        },
        {
          icon: CreditCard,
          label: 'Zahlungsmethoden',
          description: 'Kreditkarten & PayPal',
          action: () => alert('Zahlungsmethoden verwalten')
        }
      ]
    },
    {
      title: 'Einstellungen',
      items: [
        {
          icon: Bell,
          label: 'Benachrichtigungen',
          description: 'Push-Nachrichten verwalten',
          action: () => alert('Benachrichtigungen konfigurieren')
        },
        {
          icon: Globe,
          label: 'Sprache & Region',
          description: 'Deutsch (Deutschland)',
          action: () => alert('Sprache auswählen')
        },
        {
          icon: Download,
          label: 'Chat-Verlauf exportieren',
          description: 'Deine Gespräche herunterladen',
          action: () => alert('Export wird vorbereitet...')
        }
      ]
    },
    {
      title: 'Rechtliches',
      items: [
        {
          icon: Shield,
          label: 'Datenschutz',
          description: 'Datenschutzerklärung lesen',
          action: () => alert('Datenschutz öffnen')
        },
        {
          icon: Shield,
          label: 'AGB',
          description: 'Allgemeine Geschäftsbedingungen',
          action: () => alert('AGB öffnen')
        },
        {
          icon: Shield,
          label: 'Impressum',
          description: 'Rechtliche Informationen',
          action: () => alert('Impressum öffnen')
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Einstellungen</h2>
        <p className="text-white/70">Verwalte dein Konto und deine Präferenzen</p>
      </div>

      {/* User Info Card */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
            U
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">Benutzer</h3>
            <p className="text-white/60">Premium Mitglied seit März 2024</p>
            <div className="flex items-center space-x-2 mt-2">
              <Crown className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-400">Premium aktiv</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Groups */}
      {settingsGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-3">
          <h3 className="text-lg font-semibold text-white/80 px-2">{group.title}</h3>
          <div className="glass-card rounded-2xl overflow-hidden">
            {group.items.map((item, itemIndex) => (
              <button
                key={itemIndex}
                onClick={item.action}
                className={`w-full p-4 flex items-center space-x-4 hover:bg-purple-500/10 transition-all duration-200 ${
                  itemIndex !== group.items.length - 1 ? 'border-b border-purple-500/20' : ''
                } ${item.highlight ? 'bg-gradient-to-r from-purple-500/20 to-violet-500/10' : ''}`}
              >
                <div className={`p-2 rounded-lg ${
                  item.highlight ? 'bg-purple-500/30' : 'glass'
                }`}>
                  <item.icon className={`w-5 h-5 ${
                    item.highlight ? 'text-purple-300' : 'text-white/70'
                  }`} />
                </div>
                <div className="flex-1 text-left">
                  <h4 className={`font-medium ${
                    item.highlight ? 'text-purple-300' : 'text-white'
                  }`}>
                    {item.label}
                  </h4>
                  <p className="text-sm text-white/60">{item.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40" />
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Logout Button */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <button
          onClick={() => alert('Ausloggen')}
          className="w-full p-4 flex items-center space-x-4 hover:bg-red-500/10 transition-all duration-200 text-red-400"
        >
          <div className="p-2 rounded-lg bg-red-500/20">
            <LogOut className="w-5 h-5" />
          </div>
          <div className="flex-1 text-left">
            <h4 className="font-medium">Ausloggen</h4>
            <p className="text-sm text-white/60">Von deinem Konto abmelden</p>
          </div>
        </button>
      </div>

      {/* App Version */}
      <div className="text-center">
        <p className="text-xs text-white/50">HeartConnect v1.0.0</p>
        <p className="text-xs text-white/40 mt-1">© 2024 HeartConnect. Alle Rechte vorbehalten.</p>
      </div>
    </div>
  );
};

export default SettingsView;
