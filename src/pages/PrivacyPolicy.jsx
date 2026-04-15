import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';

const SECTIONS = [
  { id: 'responsible', title: '1. Verantwortlicher', content: `Verantwortlicher im Sinne der DSGVO ist:\n\nNOMDAD LLC\n8 The Green, Suite A\nDover, DE 19901, USA\nE-Mail: privacy@nomdad.com` },
  { id: 'data', title: '2. Erhobene Daten', content: `Wir erheben folgende personenbezogene Daten:\n\n• Konto­daten (E-Mail, Name, Profilfoto)\n• Fangdaten (GPS-Koordinaten, Fotos, Artangaben, Maße)\n• Nutzungsverhalten (Login-Zeiten, Seitenaufrufe, Klicks)\n• Gerätedaten (IP-Adresse, Browser-Typ, Betriebssystem)\n• Zahlungsdaten (werden direkt durch Stripe / App Store / Google Play verarbeitet, wir erhalten nur Transaktions-IDs)` },
  { id: 'purpose', title: '3. Zweck der Verarbeitung', content: `Die erhobenen Daten werden verwendet für:\n\n• Bereitstellung und Verbesserung der App-Funktionen\n• Personalisierte Fanganalysen und KI-Empfehlungen\n• Community-Funktionen (Feed, Ranglisten, Teams)\n• Abrechnungs- und Zahlungsabwicklung\n• Kommunikation mit Nutzern (Support, Newsletter mit Einwilligung)\n• Betrugs- und Missbrauchsprävention` },
  { id: 'legal_basis', title: '4. Rechtsgrundlage (DSGVO Art. 6)', content: `Die Verarbeitung basiert auf:\n\n• Art. 6 Abs. 1 lit. b DSGVO – Vertragserfüllung (Bereitstellung der App-Dienste)\n• Art. 6 Abs. 1 lit. a DSGVO – Einwilligung (z.B. Marketing-E-Mails, optionale GPS-Daten)\n• Art. 6 Abs. 1 lit. f DSGVO – Berechtigte Interessen (Sicherheit, Betrugsschutz, Produkt­verbesserung)\n• Art. 6 Abs. 1 lit. c DSGVO – Rechtliche Verpflichtung (Buchführungspflichten)` },
  { id: 'third_parties', title: '5. Drittanbieter', content: `Wir nutzen folgende Drittanbieter:\n\n• Base44 (App-Plattform, Hosting, Datenbankdienste) – USA\n• Stripe Inc. (Zahlungsabwicklung) – USA\n• Apple Inc. (In-App-Käufe iOS, App-Distribution) – USA\n• Google LLC (In-App-Käufe Android, Play Store) – USA\n• Open-Meteo / Weather-API (anonymisierte Wetterdaten) – EU/Schweiz\n• OpenStreetMap / Leaflet (Kartendaten, keine persönlichen Daten) – EU\n\nAlle US-Dienstleister haben sich zum EU-US Data Privacy Framework verpflichtet oder es bestehen Standardvertragsklauseln nach Art. 46 DSGVO.` },
  { id: 'retention', title: '6. Speicherdauer', content: `Personenbezogene Daten werden gelöscht, sobald der Zweck der Verarbeitung entfällt:\n\n• Kontodaten: Bis zur Löschung des Nutzerkontos + 30 Tage Karenzzeit\n• Fangdaten: Bis zur Kontolöschung (öffentliche Fänge ggf. anonymisiert)\n• Zahlungsdaten: 10 Jahre (gesetzliche Aufbewahrungspflicht)\n• Log-Dateien: 90 Tage\n• Cookies: Gemäß Cookie-Richtlinie (max. 365 Tage)` },
  { id: 'rights', title: '7. Betroffenenrechte', content: `Du hast folgende Rechte:\n\n• Auskunftsrecht (Art. 15 DSGVO)\n• Berichtigungsrecht (Art. 16 DSGVO)\n• Recht auf Löschung ("Recht auf Vergessenwerden", Art. 17 DSGVO)\n• Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)\n• Recht auf Datenübertragbarkeit (Art. 20 DSGVO)\n• Widerspruchsrecht (Art. 21 DSGVO)\n• Beschwerderecht bei der zuständigen Aufsichtsbehörde\n\nAnfragen bitte an: privacy@nomdad.com` },
  { id: 'cookies', title: '8. Cookies', content: `Wir verwenden technisch notwendige Cookies (Session, Authentifizierung) und optionale Cookies (Präferenzen, Spracheinstellungen). Analytische Cookies werden nur mit deiner Einwilligung gesetzt. Du kannst Cookies jederzeit in den Browser-Einstellungen deaktivieren.` },
  { id: 'analytics', title: '9. Analytics', content: `Wir setzen keine externen Analyse-Tools (z.B. Google Analytics) ohne deine ausdrückliche Einwilligung ein. Interne Nutzungsanalysen (aggregierte, anonymisierte Daten) werden zur Produkt­verbesserung genutzt und enthalten keine personenbezogenen Informationen.` },
  { id: 'processors', title: '10. Auftragsverarbeiter', content: `Auftragsverarbeitungsverträge bestehen mit:\n• Base44 (Hosting & Datenbankdienste)\n• Stripe Inc. (Zahlungsabwicklung)\n• E-Mail-Dienstleister (Support-Kommunikation)\n\nAlle Auftragsverarbeiter sind vertraglich zur Einhaltung der DSGVO verpflichtet.` },
  { id: 'transfer', title: '11. Internationaler Datentransfer', content: `Daten können in Drittländer (insb. USA) übertragen werden. Der Schutz deiner Daten wird durch EU-Standardvertragsklauseln (Art. 46 DSGVO) oder das EU-US Data Privacy Framework gewährleistet.` },
  { id: 'children', title: '12. Kinder- und Jugendschutz', content: `Unsere App ist nicht für Kinder unter 13 Jahren bestimmt. Wir erheben wissentlich keine personenbezogenen Daten von Minderjährigen unter 13 Jahren. Wenn wir feststellen, dass solche Daten erhoben wurden, werden sie unverzüglich gelöscht.` },
  { id: 'changes', title: '13. Änderungen dieser Richtlinie', content: `Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf zu aktualisieren. Wesentliche Änderungen werden dir per E-Mail oder In-App-Benachrichtigung mitgeteilt. Das Datum der letzten Aktualisierung wird oben auf dieser Seite angezeigt.` },
  { id: 'dpo', title: '14. Kontakt Datenschutzbeauftragter', content: `Bei datenschutzrechtlichen Fragen kannst du dich wenden an:\n\nDatenschutzbeauftragter\nNOMDAD LLC\nE-Mail: privacy@nomdad.com\n\nBei Beschwerden kannst du dich an deine zuständige Datenschutz­aufsichtsbehörde wenden.` },
];

function Section({ s }) {
  const [open, setOpen] = useState(false);
  return (
    <div id={s.id} className="glass-card rounded-2xl overflow-hidden scroll-mt-4">
      <button onClick={() => setOpen(v => !v)} className="w-full px-5 py-4 flex items-center justify-between text-left">
        <h2 className="font-display font-bold text-foam text-sm">{s.title}</h2>
        {open ? <ChevronUp className="w-4 h-4 text-tide-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-foam/30 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4 border-t border-tide-400/10">
          <p className="text-foam/60 text-sm leading-relaxed whitespace-pre-line pt-3">{s.content}</p>
        </div>
      )}
    </div>
  );
}

export default function PrivacyPolicy() {
  const { t } = useTranslation();

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-12 max-w-2xl mx-auto space-y-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foam">{t('legal.privacy')}</h1>
          <p className="text-foam/40 text-xs mt-1">Zuletzt aktualisiert: April 2026 · DSGVO-konform</p>
        </div>

        {/* Quick TOC */}
        <div className="glass-card rounded-2xl p-4">
          <p className="text-foam/50 text-xs mb-2 font-semibold">Inhaltsverzeichnis</p>
          <div className="grid grid-cols-2 gap-1">
            {SECTIONS.map(s => (
              <a key={s.id} href={`#${s.id}`} className="text-tide-400 text-xs truncate hover:underline">{s.title}</a>
            ))}
          </div>
        </div>

        {SECTIONS.map(s => <Section key={s.id} s={s} />)}

        <p className="text-center text-foam/20 text-xs">© 2026 NOMDAD LLC · StrikeAhead</p>
      </div>
    </PageTransition>
  );
}