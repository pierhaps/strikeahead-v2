import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function PageNotFound() {
    const location = useLocation();
    const pageName = location.pathname.substring(1);
    const { t } = useTranslation();

    return (
        <div className="min-h-screen flex items-center justify-center p-6"
            style={{ background: 'linear-gradient(135deg, #0A1628 0%, #132744 100%)' }}>
            <div className="max-w-md w-full text-center space-y-8">
                {/* 404 */}
                <div className="space-y-2">
                    <h1 className="text-8xl font-black text-transparent"
                        style={{ background: 'linear-gradient(135deg, #2DA8FF 0%, #2EE0C9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        404
                    </h1>
                    <div className="h-0.5 w-16 mx-auto rounded-full"
                        style={{ background: 'linear-gradient(90deg, #2DA8FF, #2EE0C9)' }} />
                </div>

                {/* Message */}
                <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-white">
                        {t('error.page_not_found', { defaultValue: 'Seite nicht gefunden' })}
                    </h2>
                    <p className="text-white/50 leading-relaxed text-sm">
                        <span className="text-cyan-400 font-medium">"{pageName}"</span>
                    </p>
                </div>

                {/* Button */}
                <div>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm transition-all"
                        style={{ background: 'linear-gradient(135deg, #2DA8FF 0%, #0EBDD8 100%)', color: '#0A1828' }}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        {t('error.go_home', { defaultValue: 'Zur Startseite' })}
                    </button>
                </div>
            </div>
        </div>
    );
}