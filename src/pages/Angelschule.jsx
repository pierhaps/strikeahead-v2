import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronLeft, Play } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';

const tideEase = [0.2, 0.8, 0.2, 1];

const CATEGORIES = [
  { id: 'basics', icon: '🎣', label: 'Grundlagen', color: '#1FA7B8', articles: [
    { title: 'Angelausrüstung für Anfänger', duration: '8 min', content: 'Die richtige Ausrüstung ist das A und O beim Angeln. Für den Einstieg empfehlen wir eine mittelschwere Rute (2,4–3 m), eine Stationärrolle (2000–3000er), Monofilschnur (0,25–0,30 mm) und eine Auswahl grundlegender Haken (Größen 4–10).\n\nWichtige Grundausrüstung:\n• Rute & Rolle\n• Angelschein\n• Hakensortiment\n• Schwimmer und Grundbleie\n• Köderbox\n• Kescher\n\nInvestiere zunächst in Qualität bei Rute und Rolle — günstiger Köder und Haken sind am Anfang kein Problem.' },
    { title: 'Den ersten Angelschein machen', duration: '5 min', content: 'In Deutschland ist ein gültiger Fischereischein Pflicht. Der Sachkundenachweis (Prüfung) muss beim zuständigen Fischereiverband abgelegt werden. Folgende Themen werden geprüft:\n\n• Fischkunde (Arten, Biologie)\n• Gewässerkunde\n• Tierschutz beim Angeln\n• Fischereirechtliche Grundlagen\n• Gerätekunde\n\nNach bestandener Prüfung erhältst du den Fischereischein auf Lebenszeit.' },
    { title: 'Knoten für Anfänger', duration: '6 min', content: 'Die 3 wichtigsten Angelknoten:\n\n**Palomar-Knoten** — Für Haken und Wirbel. Sehr zuverlässig, einfach zu binden.\n\n**Clinch-Knoten** — Universalknoten für Monofilschnur. Schritt für Schritt: Schnur durch Öse, 5-7 Mal umwickeln, zurückführen, festziehen.\n\n**Alberto-Knoten** — Verbindet Haupt- und Vorfachschnur. Ideal für Fluoro-Carbon-Vorfach.' },
  ]},
  { id: 'techniques', icon: '🎯', label: 'Techniken', color: '#F5C34B', articles: [
    { title: 'Spinnfischen — Grundtechnik', duration: '10 min', content: 'Das Spinnfischen (Spinning) ist eine der aktivsten Angelmethoden. Du wirst durch das Gewässer gelaufen und wirst deinen Köder immer wieder ausgeworfen.\n\nGrundprinzip: Kunstköder auswerfen → einkurbeln → Biss provozieren\n\nGeeignete Köder:\n• Gummifische (Shads, Twister)\n• Wobbler (Floating, Sinking, Suspending)\n• Spinner und Blinker\n• Jig-Köder\n\nBest Practice: Köder nahe an Strukturen (Schilfkanten, Steinblöcke, Unterwasserhindernisse) führen.' },
    { title: 'Grundangeln', duration: '7 min', content: 'Beim Grundangeln liegt der Köder auf dem Gewässerboden. Diese Methode eignet sich besonders für Karpfen, Brachsen, Aale und bodenbewohnende Arten.\n\nAufbau:\n1. Hauptschnur → Laufende Bleimontage → Wirbel → Vorfach (40–60 cm) → Haken\n\nKöder: Boilies, Mais, Würmer, Brot, Pellets\n\nHinweis: Bei Strömung schwereres Blei verwenden.' },
    { title: 'Fliegenfischen — Einführung', duration: '12 min', content: 'Fliegenfischen ist eine der anspruchsvollsten und befriedigendsten Angelmethoden. Statt des Ködergewichts nutzt man das Gewicht der Fliegenschnur zum Werfen.\n\nBenötigte Ausrüstung:\n• Fliegenrute (AFTM 4–7 für Forellen)\n• Fliegenrolle\n• Schwimmschnur\n• Vorfach (Tappered Leader)\n• Kunstfliegen (Trockene, Nymphen, Streamer)\n\nEinstieg: Beginne auf stehenden Gewässern, übe den Überkopfwurf.' },
  ]},
  { id: 'knots', icon: '🪢', label: 'Knoten', color: '#4DC3D1', articles: [
    { title: 'Der Palomar-Knoten', duration: '3 min', content: 'Der Palomar-Knoten ist der zuverlässigste Knoten zum Befestigen von Haken, Wirbeln und Ködern.\n\nAnleitung:\n1. Schnur doppelt nehmen und durch die Öse führen (ca. 10 cm Schlaufe)\n2. Einfachen Überhandknoten mit der Doppelschnur machen\n3. Schlaufe über den Haken führen\n4. Knoten befeuchten und festziehen\n5. Überstehendes Ende kürzen\n\nKnotenbruchfestigkeit: ~95% der Schnurfestigkeit' },
    { title: 'FG-Knoten (Braid-Fluoro)', duration: '5 min', content: 'Der FG-Knoten verbindet geflochtene Hauptschnur mit einem Fluorocarbon-Vorfach. Sehr schmal und durch die Rutenringe...\n\nAnleitung (vereinfacht):\n1. Fluoro-Vorfach spannen, Braid 20x kreuzen\n2. Hitch-Knoten zur Sicherung\n3. Abschneiden und testen\n\nTipp: Am Anfang vor dem Wasser üben!' },
  ]},
  { id: 'equipment', icon: '⚙️', label: 'Ausrüstung', color: '#7FDCE5', articles: [
    { title: 'Ruten-Guide: Die richtige Wahl', duration: '9 min', content: 'Die Wahl der richtigen Rute hängt von der Zielfischart, der Gewässerart und der Technik ab.\n\nRutenklassen:\n• Ultralight (UL): ≤5g — für Barsch, Forelle\n• Light (L): 2–10g — Vielseitig\n• Medium (M): 5–25g — Hecht, Zander\n• Heavy (H): 15–60g+ — Wels, Meerforelle\n\nWurflänge: Kurze Ruten (≤2,4m) für enge Gewässer, lange Ruten (3m+) für weite Würfe.' },
    { title: 'Rollen richtig einstellen', duration: '6 min', content: 'Die Bremseinstellung deiner Rolle ist entscheidend, um Schnurbrüche zu vermeiden.\n\nFaustformel: Bremse auf 1/3 der Schnurzugfestigkeit einstellen.\n\nTest: Schnur mit der Hand ziehen — sie sollte gleichmäßig ablaufen, ohne zu reißen.\n\nFrontbremse vs. Heckbremse:\n• Frontbremse: Präziser, für erfahrene Angler\n• Heckbremse: Schnell zugänglich, ideal für Anfänger' },
  ]},
  { id: 'weather', icon: '🌤️', label: 'Wetter lesen', color: '#FFD872', articles: [
    { title: 'Barometerdruck und Fischaktivität', duration: '8 min', content: 'Der Luftdruck beeinflusst das Verhalten von Fischen erheblich.\n\nSteigender Druck (Hochdruck):\n• Fische werden aktiver\n• Ideale Angelbedingungen nach dem Druckanstieg\n• Fische kommen aus der Tiefe\n\nFallender Druck (Tiefdruckfront):\n• Fische ziehen sich in tiefere Schichten zurück\n• Kurz vor der Front oft gute Fänge\n• Hinter der Front meist Beißflaute\n\nStabiler Druck: Gleichmäßige Aktivität, vorhersagbar.' },
    { title: 'Mondphasen beim Angeln', duration: '7 min', content: 'Solunartheorie: Während Voll- und Neumond sowie während der Auf- und Untergangszeiten des Mondes sind Fische aktiver.\n\nPraktische Hinweise:\n• Vollmond → Fische fressen intensiv (auch nachts)\n• Neumond → Oft gute Tagesfänge\n• Solunar-Apps zeigen Major/Minor-Perioden an\n\nWichtig: Solunar ist ein Faktor von vielen — Wetter und Jahreszeit überwiegen oft.' },
  ]},
  { id: 'ethics', icon: '🌿', label: 'Ethik & Eco', color: '#4DC3D1', articles: [
    { title: 'Catch & Release richtig gemacht', duration: '6 min', content: 'C&R schützt Fischbestände, muss aber korrekt ausgeführt werden.\n\nGoldene Regeln:\n• Fisch so kurz wie möglich aus dem Wasser\n• Nasse Hände beim Anfassen\n• Haken mit Zange oder Haken-Löser entfernen\n• Fisch im Wasser erholen lassen bevor freilassen\n• Kein Wurf zurück ins Wasser\n\nVerletzungen:\n• Barbless Hooks (ohne Widerhaken) verwenden\n• Bei tiefer Verschluckung: Schnur abschneiden, Haken löst sich selbst' },
    { title: 'Müllfreies Angeln', duration: '4 min', content: 'Als Angler sind wir Hüter unserer Gewässer. Müllfreies Angeln ist nicht nur ethisch geboten — es schützt auch die Tierwelt.\n\nCheckliste:\n✓ Eigenen Müll immer mitnehmen\n✓ Alten Schnur nie ins Wasser oder Gebüsch\n✓ Setzkescher-Verwendung nur bei Notwendigkeit\n✓ Cleanup-Fotos in der App hochladen (Eco-Score)\n✓ Anderen Anglern freundlich Hinweise geben' },
  ]},
];

function ArticleView({ article, category, onBack }) {
  const paragraphs = article.content.split('\n\n');
  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3, ease: tideEase }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="w-9 h-9 rounded-xl glass-card flex items-center justify-center">
          <ChevronLeft className="w-4 h-4 text-foam/60" />
        </button>
        <div>
          <p className="text-foam/40 text-xs">{category.label}</p>
          <h2 className="font-display font-bold text-foam text-lg leading-tight">{article.title}</h2>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-4 mb-4 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-tide-400" />
        <span className="text-foam/60 text-sm">{article.duration} Lesezeit</span>
      </div>

      <div className="space-y-4">
        {paragraphs.map((para, i) => {
          if (para.startsWith('**') || para.startsWith('#')) {
            return <h3 key={i} className="font-display font-bold text-foam text-base">{para.replace(/\*\*/g, '').replace(/^#+\s/, '')}</h3>;
          }
          return <p key={i} className="text-foam/70 text-sm leading-relaxed whitespace-pre-line">{para}</p>;
        })}
      </div>
    </motion.div>
  );
}

export default function Angelschule() {
  const [selectedCat, setSelectedCat] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4">
        <AnimatePresence mode="wait">
          {!selectedCat && !selectedArticle && (
            <motion.div key="categories" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mb-6">
                <p className="text-foam/50 text-sm">Wissen & Lernen</p>
                <h1 className="font-display text-2xl font-extrabold text-foam">Angelschule</h1>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((cat, i) => (
                  <motion.button key={cat.id} onClick={() => setSelectedCat(cat)}
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06 }}
                    whileTap={{ scale: 0.96 }}
                    className="glass-card rounded-2xl p-4 text-left h-28 flex flex-col justify-between"
                    style={{ borderColor: `${cat.color}22` }}>
                    <span className="text-3xl">{cat.icon}</span>
                    <div>
                      <p className="font-display font-bold text-foam text-sm">{cat.label}</p>
                      <p className="text-foam/40 text-xs">{cat.articles.length} Artikel</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {selectedCat && !selectedArticle && (
            <motion.div key="articles" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setSelectedCat(null)} className="w-9 h-9 rounded-xl glass-card flex items-center justify-center">
                  <ChevronLeft className="w-4 h-4 text-foam/60" />
                </button>
                <div>
                  <p className="text-foam/40 text-xs">Angelschule</p>
                  <h2 className="font-display font-bold text-foam text-xl">{selectedCat.icon} {selectedCat.label}</h2>
                </div>
              </div>
              <div className="space-y-3">
                {selectedCat.articles.map((art, i) => (
                  <motion.button key={art.title} onClick={() => setSelectedArticle(art)}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full glass-card rounded-2xl p-4 text-left flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                      style={{ background: `${selectedCat.color}18`, border: `1px solid ${selectedCat.color}30` }}>
                      {selectedCat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foam text-sm">{art.title}</p>
                      <p className="text-foam/40 text-xs mt-0.5">{art.duration} Lesezeit</p>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-foam/30 rotate-180" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {selectedArticle && (
            <motion.div key="article-content">
              <ArticleView article={selectedArticle} category={selectedCat} onBack={() => setSelectedArticle(null)} />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="h-4" />
      </div>
    </PageTransition>
  );
}