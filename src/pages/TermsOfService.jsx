import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';

const SECTIONS = [
  { id: 'scope', title: '1. Geltungsbereich', content: `Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der StrikeAhead-App, betrieben von NOMDAD LLC, 8 The Green, Suite A, Dover, DE 19901, USA. Mit der Registrierung und Nutzung der App stimmst du diesen AGB zu. Falls du die AGB nicht akzeptierst, darfst du die App nicht nutzen.` },
  { id: 'services', title: '2. Leistungsumfang', content: `Free-Tarif: Grundlegende Fangerfassung (max. 5 Fänge/Monat), Community-Feed, Basis-Karte.\n\nBezahltarife (Angler / Pro / Legend): Erweiterte Funktionen gemäß der aktuellen Preisseite. NOMDAD LLC behält sich vor, den Leistungsumfang einzelner Tarife mit angemessener Ankündigungsfrist anzupassen.` },
  { id: 'registration', title: '3. Registrierung', content: `Du musst mindestens 13 Jahre alt sein (in der EU mindestens 16 Jahre ohne elterliche Zustimmung). Du bist verpflichtet, wahrheitsgemäße Angaben zu machen und dein Konto vor unbefugtem Zugriff zu schützen. NOMDAD LLC kann Konten bei Verdacht auf Missbrauch ohne Vorankündigung sperren.` },
  { id: 'obligations', title: '4. Nutzerpflichten', content: `Du verpflichtest dich:\n• Nur eigene, rechtmäßig erstellte Inhalte hochzuladen\n• Die App nicht für illegale Zwecke zu nutzen\n• Keine automatisierten Zugriffe (Bots, Scraper) einzusetzen\n• Angeln gemäß lokaler Gesetze und Vorschriften zu betreiben\n• Andere Nutzer respektvoll zu behandeln` },
  { id: 'prohibited', title: '5. Verbotene Inhalte', content: `Folgende Inhalte sind ausdrücklich verboten:\n• Illegale, beleidigende, diskriminierende oder urheberrechtsverletzende Inhalte\n• Personenbezogene Daten Dritter ohne deren Einwilligung\n• Gefälschte Fangdaten oder manipulierte Fotos\n• Spam, Werbung ohne Genehmigung, Phishing\n• Inhalte, die Tierschutzgesetze verletzen\n\nVerstöße können zur sofortigen Kontosperrung führen.` },
  { id: 'hookpoints', title: '6. HookPoints-Regeln', content: `HookPoints (HP) sind virtuelle Punkte ohne monetären Wert. Sie können:\n• Nicht ausgezahlt oder in Geld umgewandelt werden\n• Nicht übertragen oder gehandelt werden\n• Bei Verstoß gegen die AGB ohne Entschädigung verfallen\n\nNOMDAD LLC behält sich vor, das HookPoints-System jederzeit anzupassen. Erworbene HP bleiben bei Plan-Downgrades erhalten.` },
  { id: 'subscription', title: '7. Subscription-Bedingungen', content: `Bezahlte Abonnements werden automatisch verlängert. Eine Kündigung ist jederzeit zum Ende des aktuellen Abrechnungszeitraums möglich.\n\nWiderrufsrecht (EU): EU-Verbraucher haben ein 14-tägiges Widerrufsrecht ab Vertragsschluss. Das Widerrufsrecht erlischt, wenn die Leistung vollständig erbracht wurde und du vor Beginn der Ausführung ausdrücklich zugestimmt hast.\n\nRückerstattungen: Im Ermessen von NOMDAD LLC. Gesetzliche Ansprüche bleiben unberührt.` },
  { id: 'liability', title: '8. Haftungsbegrenzung', content: `NOMDAD LLC haftet nicht für:\n• Datenverlust durch höhere Gewalt oder Systemausfälle\n• Schäden durch Nutzung falscher Fischerei-Informationen aus der App\n• Handlungen Dritter (andere Nutzer, externe Dienste)\n\nDie Haftung ist auf den Betrag begrenzt, den du in den letzten 12 Monaten für die App gezahlt hast. Für Vorsatz und grobe Fahrlässigkeit sowie für Personenschäden gilt die gesetzliche Haftung uneingeschränkt.` },
  { id: 'law', title: '9. Anwendbares Recht', content: `Diese AGB unterliegen dem Recht des US-Bundesstaates Delaware, unter Ausschluss der Kollisionsnormen. Für EU-Verbraucher gelten zwingend anwendbare Verbraucherschutzvorschriften ihres Heimatlandes unberührt davon.` },
  { id: 'arbitration', title: '10. Streitbeilegung', content: `Für US-Nutzer: Streitigkeiten werden durch verbindliches Schiedsverfahren nach den Regeln der American Arbitration Association beigelegt. Sammelklagen sind ausgeschlossen.\n\nFür EU-Nutzer: Die EU-Kommission stellt eine Plattform zur Online-Streitbeilegung bereit: https://ec.europa.eu/consumers/odr. Wir sind nicht zur Teilnahme an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle verpflichtet, aber bereit, eine einvernehmliche Lösung zu finden.` },
  { id: 'changes', title: '11. Änderungsvorbehalt', content: `NOMDAD LLC behält sich vor, diese AGB zu ändern. Wesentliche Änderungen werden dir mindestens 30 Tage im Voraus per E-Mail oder In-App-Benachrichtigung mitgeteilt. Wenn du der Änderung nicht widersprichst, gilt die Änderung als akzeptiert. Bei Widerspruch kannst du dein Konto kostenlos löschen.` },
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

export default function TermsOfService() {
  const { t } = useTranslation();

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-12 max-w-2xl mx-auto space-y-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foam">{t('legal.terms')}</h1>
          <p className="text-foam/40 text-xs mt-1">Stand: April 2026 · StrikeAhead by NOMDAD LLC</p>
        </div>

        {/* TOC */}
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