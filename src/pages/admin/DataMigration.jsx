import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, CheckCircle2, AlertCircle, Loader } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageTransition from '../../components/ui/PageTransition';

const SPECIES_MIGRATIONS = [
  { id: '69e1306080be9dee5d04a280', name_es: 'Anjova', name_fr: 'Tassergal', name_it: 'Pesce serra', name_hr: 'Strijelka', name_pt: 'Anchova', name_nl: 'Blauwbaars', name_tr: 'Lüfer', name_el: 'Γοφάρι', name_sq: 'Lufari' },
  { id: '69e1306080be9dee5d04a281', name_es: 'Barracuda', name_fr: 'Barracuda', name_it: 'Barracuda', name_hr: 'Barakuda', name_pt: 'Barracuda', name_nl: 'Barracuda', name_tr: 'Barakuda', name_el: 'Μπαρακούντα', name_sq: 'Barrakuda' },
  { id: '69e1306080be9dee5d04a282', name_es: 'Caballa', name_fr: 'Maquereau', name_it: 'Sgombro', name_hr: 'Skuša', name_pt: 'Cavala', name_nl: 'Makreel', name_tr: 'Uskumru', name_el: 'Σκουμπρί', name_sq: 'Skumbri' },
  { id: '69e1306080be9dee5d04a283', name_es: 'Lubina', name_fr: 'Bar commun', name_it: 'Spigola', name_hr: 'Lubin', name_pt: 'Robalo', name_nl: 'Zeebaars', name_tr: 'Levrek', name_el: 'Λαβράκι', name_sq: 'Levrek' },
  { id: '69e1306080be9dee5d04a284', name_es: 'Fletán', name_fr: 'Flétan', name_it: 'Halibut', name_hr: 'Halibut', name_pt: 'Alabote', name_nl: 'Heilbot', name_tr: 'Halibut', name_el: 'Χαλιμπούτ', name_sq: 'Halibut' },
  { id: '69e1306080be9dee5d04a285', name_es: 'Lucio', name_fr: 'Brochet', name_it: 'Luccio', name_hr: 'Štuka', name_pt: 'Lúcio', name_nl: 'Snoek', name_tr: 'Turna', name_el: 'Τούρνα', name_sq: 'Mlyshi' },
  { id: '69e1306080be9dee5d04a286', name_es: 'Lucioperca', name_fr: 'Sandre', name_it: 'Sandra', name_hr: 'Smuđ', name_pt: 'Lúcio-perca', name_nl: 'Snoekbaars', name_tr: 'Sudak', name_el: 'Ποταμολάβρακο', name_sq: 'Koce' },
  { id: '69e1306080be9dee5d04a287', name_es: 'Perca', name_fr: 'Perche', name_it: 'Persico', name_hr: 'Grgeč', name_pt: 'Perca', name_nl: 'Baars', name_tr: 'Tatlısu levreği', name_el: 'Πέρκα', name_sq: 'Sharmak' },
  { id: '69e1306080be9dee5d04a288', name_es: 'Carpa', name_fr: 'Carpe', name_it: 'Carpa', name_hr: 'Šaran', name_pt: 'Carpa', name_nl: 'Karper', name_tr: 'Sazan', name_el: 'Κυπρίνος', name_sq: 'Krap' },
  { id: '69e1306080be9dee5d04a289', name_es: 'Siluro', name_fr: 'Silure', name_it: 'Siluro', name_hr: 'Som', name_pt: 'Siluro', name_nl: 'Meerval', name_tr: 'Yayın', name_el: 'Γουλιανός', name_sq: 'Mlyshi i madh' },
  { id: '69e1306080be9dee5d04a28a', name_es: 'Anguila', name_fr: 'Anguille', name_it: 'Anguilla', name_hr: 'Jegulja', name_pt: 'Enguia', name_nl: 'Paling', name_tr: 'Yılan balığı', name_el: 'Χέλι', name_sq: 'Ngjala' },
  { id: '69e1306080be9dee5d04a28b', name_es: 'Trucha común', name_fr: 'Truite fario', name_it: 'Trota fario', name_hr: 'Potočna pastrva', name_pt: 'Truta-fário', name_nl: 'Beekforel', name_tr: 'Dere alabalığı', name_el: 'Πέστροφα', name_sq: 'Troftë' },
  { id: '69e1306080be9dee5d04a28c', name_es: 'Trucha de mar', name_fr: 'Truite de mer', name_it: 'Trota di mare', name_hr: 'Morska pastrva', name_pt: 'Truta-marisca', name_nl: 'Zeeforel', name_tr: 'Deniz alabalığı', name_el: 'Θαλάσσια πέστροφα', name_sq: 'Troftë deti' },
  { id: '69e1306080be9dee5d04a28d', name_es: 'Salmón', name_fr: 'Saumon', name_it: 'Salmone', name_hr: 'Losos', name_pt: 'Salmão', name_nl: 'Zalm', name_tr: 'Somon', name_el: 'Σολομός', name_sq: 'Salmon' },
  { id: '69e1306080be9dee5d04a28e', name_es: 'Bacalao', name_fr: 'Morue', name_it: 'Merluzzo', name_hr: 'Bakalar', name_pt: 'Bacalhau', name_nl: 'Kabeljauw', name_tr: 'Morina', name_el: 'Μπακαλιάρος', name_sq: 'Merluc' },
  { id: '69e1306080be9dee5d04a28f', name_es: 'Tímalo', name_fr: 'Ombre commun', name_it: 'Temolo', name_hr: 'Lipljen', name_pt: 'Tímalo', name_nl: 'Vlagzalm', name_tr: 'Ağ balığı', name_el: 'Σκιόψαρο', name_sq: 'Lipan' },
  { id: '69e1306080be9dee5d04a290', name_es: 'Trucha arcoíris', name_fr: 'Truite arc-en-ciel', name_it: 'Trota iridea', name_hr: 'Kalifornijska pastrva', name_pt: 'Truta-arco-íris', name_nl: 'Regenboogforel', name_tr: 'Gökkuşağı alabalığı', name_el: 'Ιριδίζουσα πέστροφα', name_sq: 'Troftë ylberi' },
  { id: '69e1306080be9dee5d04a291', name_es: 'Tenca', name_fr: 'Tanche', name_it: 'Tinca', name_hr: 'Linjak', name_pt: 'Tenca', name_nl: 'Zeelt', name_tr: 'Kadife balığı', name_el: 'Γλήνι', name_sq: 'Tinkë' },
  { id: '69e1306080be9dee5d04a292', name_es: 'Brema', name_fr: 'Brème', name_it: 'Abramide', name_hr: 'Deverika', name_pt: 'Brema', name_nl: 'Brasem', name_tr: 'Çapak balığı', name_el: 'Λεστιά', name_sq: 'Deverikë' },
  { id: '69e1306080be9dee5d04a293', name_es: 'Aspio', name_fr: 'Aspe', name_it: 'Aspio', name_hr: 'Bolen', name_pt: 'Áspio', name_nl: 'Roofblei', name_tr: 'Kızılkanat', name_el: 'Κοκκινοφτέρα', name_sq: 'Bolen' },
  { id: '69e1306080be9dee5d04a294', name_es: 'Coregono', name_fr: 'Corégone', name_it: 'Coregone', name_hr: 'Bjelica', name_pt: 'Coregono', name_nl: 'Grote marene', name_tr: 'Ak balık', name_el: 'Λαβαρέτο', name_sq: 'Koregon' },
  { id: '69e1306080be9dee5d04a295', name_es: 'Eperlano', name_fr: 'Éperlan', name_it: 'Sperlano', name_hr: 'Tinta', name_pt: 'Eperlano', name_nl: 'Spiering', name_tr: 'Gümüş balığı', name_el: 'Οσμέρος', name_sq: 'Shpërlan' },
  { id: '69e1306080be9dee5d04a296', name_es: 'Aguja', name_fr: 'Orphie', name_it: 'Aguglia', name_hr: 'Iglica', name_pt: 'Agulha', name_nl: 'Geep', name_tr: 'Zargana', name_el: 'Ζαργάνα', name_sq: 'Zarganë' },
  { id: '69e1306080be9dee5d04a297', name_es: 'Platija', name_fr: 'Flet', name_it: 'Passera', name_hr: 'Iverak', name_pt: 'Solha', name_nl: 'Bot', name_tr: 'Pisi balığı', name_el: 'Χωματίδα', name_sq: 'Shojzë' },
  { id: '69e1306080be9dee5d04a298', name_es: 'Solla', name_fr: 'Plie', name_it: 'Platessa', name_hr: 'Iverak zlatopjeg', name_pt: 'Solha-legítima', name_nl: 'Schol', name_tr: 'Pisi', name_el: 'Χρυσόψαρο', name_sq: 'Shojzë e artë' },
  { id: '69e1306080be9dee5d04a299', name_es: 'Lobina negra', name_fr: 'Achigan à grande bouche', name_it: 'Persico trota', name_hr: 'Pastrvski grgeč', name_pt: 'Achigã', name_nl: 'Forelbaars', name_tr: 'Largemouth bass', name_el: 'Μαυρόπερκα', name_sq: 'Basi gojëgjerë' },
  { id: '69e1306080be9dee5d04a29a', name_es: 'Atún rojo', name_fr: 'Thon rouge', name_it: 'Tonno rosso', name_hr: 'Tuna', name_pt: 'Atum-rabilho', name_nl: 'Blauwvintonijn', name_tr: 'Orkinos', name_el: 'Τόνος', name_sq: 'Ton' },
];

export default function DataMigration() {
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState({ total: 0, success: 0, failed: 0 });

  const runMigration = async () => {
    setRunning(true);
    setLogs([]);
    setSummary({ total: SPECIES_MIGRATIONS.length, success: 0, failed: 0 });

    let successCount = 0;
    let failedCount = 0;

    for (const species of SPECIES_MIGRATIONS) {
      const { id, ...translations } = species;
      try {
        await base44.entities.Species.update(id, translations);
        successCount++;
        setLogs(prev => [...prev, { id, status: 'success', message: `Updated species ${id}` }]);
        setSummary(prev => ({ ...prev, success: successCount }));
      } catch (error) {
        failedCount++;
        setLogs(prev => [...prev, { id, status: 'error', message: `Failed: ${error.message}` }]);
        setSummary(prev => ({ ...prev, failed: failedCount }));
      }
    }

    setRunning(false);
  };

  return (
    <PageTransition>
      <div className="px-4 pt-6 pb-4 space-y-4" style={{ background: 'linear-gradient(180deg, #0A1828 0%, #02152B 100%)' }}>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foam">Data Migration</h1>
          <p className="text-foam/50 text-sm">Species Translation Migration (Admin Only)</p>
        </div>

        <motion.button
          onClick={runMigration}
          disabled={running}
          whileTap={{ scale: 0.97 }}
          className="w-full py-3.5 rounded-2xl font-bold text-navy-900 flex items-center justify-center gap-2 disabled:opacity-60"
          style={{
            background: running ? 'rgba(232,240,245,0.3)' : 'linear-gradient(135deg, #B6F03C 0%, #2EE0C9 60%, #2DA8FF 100%)',
            boxShadow: '0 8px 28px rgba(46,224,201,0.35)',
          }}
        >
          {running && <Loader className="w-4 h-4 animate-spin" />}
          {running ? 'Running Migration...' : 'Run Species Translation Migration'}
          {!running && <Play className="w-4 h-4" />}
        </motion.button>

        {summary.total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-2 rounded-2xl p-4"
            style={{ background: 'rgba(14,30,48,0.6)', border: '1px solid rgba(232,240,245,0.1)' }}
          >
            <div className="text-center">
              <p className="font-display font-bold text-foam text-lg">{summary.total}</p>
              <p className="text-foam/40 text-xs uppercase tracking-wider">Total</p>
            </div>
            <div className="text-center">
              <p className="font-display font-bold text-green-400 text-lg">{summary.success}</p>
              <p className="text-foam/40 text-xs uppercase tracking-wider">Success</p>
            </div>
            <div className="text-center">
              <p className="font-display font-bold text-red-400 text-lg">{summary.failed}</p>
              <p className="text-foam/40 text-xs uppercase tracking-wider">Failed</p>
            </div>
          </motion.div>
        )}

        {logs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1.5 max-h-[60vh] overflow-y-auto"
            style={{ background: 'rgba(14,30,48,0.4)', borderRadius: '1rem', padding: '1rem', border: '1px solid rgba(232,240,245,0.05)' }}
          >
            {logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-start gap-2 text-xs p-2 rounded-lg"
                style={{ background: log.status === 'success' ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)' }}
              >
                {log.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={log.status === 'success' ? 'text-green-300' : 'text-red-300'}>{log.message}</p>
                  <p className="text-foam/30 text-[10px] font-mono mt-0.5">{log.id}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}