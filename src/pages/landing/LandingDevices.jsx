import React from 'react';
import { motion } from 'framer-motion';

const tideEase = [0.2, 0.8, 0.2, 1];

function DesktopMockup() {
  return (
    <div className="relative">
      {/* Screen */}
      <div
        className="rounded-2xl overflow-hidden border border-white/10"
        style={{ background: '#021521', aspectRatio: '16/10', width: '100%' }}
      >
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-12 border-r border-tide-300/10 flex flex-col items-center py-3 gap-3">
            {['🎣','📊','🗺️','👤'].map((e, i) => (
              <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${i === 0 ? 'gradient-tide' : 'bg-abyss-700/60'}`}>{e}</div>
            ))}
          </div>
          {/* Content */}
          <div className="flex-1 p-3 flex flex-col gap-2">
            <p className="text-foam/40 text-[8px] font-display font-bold uppercase tracking-widest">Dashboard</p>
            <div className="grid grid-cols-3 gap-1.5">
              {['142 Fänge','87% Score','#12 Rang'].map((s, i) => (
                <div key={i} className="glass-card rounded-xl p-1.5 text-center">
                  <p className={`font-display font-bold text-sm ${i === 1 ? 'text-sun-400' : 'text-gradient-tide'}`}>{s.split(' ')[0]}</p>
                  <p className="text-foam/30 text-[8px]">{s.split(' ').slice(1).join(' ')}</p>
                </div>
              ))}
            </div>
            <div className="glass-card rounded-xl p-2 flex-1">
              <div className="h-full flex items-end gap-1 pb-1">
                {[40, 65, 35, 80, 55, 70, 45, 90, 60, 75].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: i === 7 ? '#F5C34B' : '#1FA7B8', opacity: 0.6 + i * 0.03 }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Stand */}
      <div className="mx-auto w-1/3 h-3 bg-white/10 rounded-b-lg" />
      <div className="mx-auto w-2/5 h-1.5 rounded-full bg-white/5" />
    </div>
  );
}

function MobileMockup({ isAndroid = false }) {
  const radius = isAndroid ? 'rounded-[24px]' : 'rounded-[32px]';
  return (
    <div className="relative mx-auto" style={{ width: 130 }}>
      <div
        className={`${radius} overflow-hidden border border-white/10`}
        style={{ background: '#021521', aspectRatio: '9/19' }}
      >
        {/* Notch / punch-hole */}
        {isAndroid ? (
          <div className="flex justify-center pt-2">
            <div className="w-3 h-3 bg-black rounded-full" />
          </div>
        ) : (
          <div className="flex justify-center pt-1.5">
            <div className="w-10 h-2.5 bg-black rounded-full" />
          </div>
        )}
        <div className="px-2 pt-1 space-y-1.5">
          <div className="glass-card rounded-xl p-2">
            <p className="text-[7px] text-foam/40">Fänge gesamt</p>
            <p className="font-display font-bold text-sm text-sun-400">142</p>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {['🐟 Fang','🗺️ Map'].map((t, i) => (
              <div key={i} className={`rounded-lg p-1.5 text-center text-[7px] font-bold ${i === 0 ? 'gradient-tide text-white' : 'bg-abyss-700/70 text-foam/50'}`}>{t}</div>
            ))}
          </div>
          <div className="glass-card rounded-xl p-1.5">
            <p className="text-[6px] text-foam/30 mb-1">Forecast</p>
            <div className="flex gap-0.5 items-end h-5">
              {[30,50,20,65,40].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: i === 3 ? '#F5C34B' : '#1FA7B8', opacity: 0.7 }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const devices = [
  { label: 'Web-App (Desktop)', caption: 'Vollständiges Dashboard im Browser', component: <DesktopMockup /> },
  { label: 'iOS App', caption: 'iPhone App Store', component: <MobileMockup isAndroid={false} /> },
  { label: 'Android App', caption: 'Google Play Store', component: <MobileMockup isAndroid={true} /> },
];

export default function LandingDevices() {
  return (
    <section className="py-24 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-tide-400 text-sm font-bold uppercase tracking-widest">Plattform</span>
          <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-foam mt-3 mb-4">
            Überall dabei —{' '}
            <span className="text-gradient-tide">auf jedem Gerät</span>
          </h2>
          <p className="text-foam/50 text-lg max-w-xl mx-auto">
            Eine App, drei Plattformen. Deine Fänge sind immer synchronisiert — egal ob du am See oder am Schreibtisch bist.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
          {devices.map((device, i) => (
            <motion.div
              key={device.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.12, ease: tideEase }}
              className="flex flex-col items-center gap-5"
            >
              <div className="w-full">
                {device.component}
              </div>
              <div className="text-center">
                <p className="font-display font-bold text-foam">{device.label}</p>
                <p className="text-foam/40 text-sm mt-1">{device.caption}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}