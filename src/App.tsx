import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownUp,
  ArrowRight,
  Check,
  ChevronRight,
  Cloud,
  Download,
  ExternalLink,
  Files,
  KeyRound,
  LockKeyhole,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Sparkles,
  WifiOff,
  X,
} from 'lucide-react'

type Direction = 'EUR_VND' | 'VND_EUR'

const DRIVE_URL = 'https://drive.google.com/drive/folders/1gy_-Vh-3zXJPPjYbyaEdsPWrpJUFaELP?usp=sharing'
const PCLOUD_URL = 'https://e.pcloud.link/publink/show?code=kZOsNk7ZgPErD3v8DCm26vTiS6OnWLcLUycy'
const DEFAULT_RATE = 27_500
const COMMON_EUR = [5, 10, 20, 50, 100, 250, 500, 1000]
const ACCESS_DIGEST = 'a78f19952edd18bf02b3c9eb704b088e2120941d6acb22f6f795c42796e60252'

const euroNumber = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
const dongNumber = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })

function parseInput(raw: string) {
  const normalized = raw.replace(/\s/g, '').replace(',', '.').replace(/[^0-9.]/g, '')
  return Number.parseFloat(normalized) || 0
}

function formatEuros(value: number) { return `${euroNumber.format(value)} €` }
function formatDongs(value: number) { return `${dongNumber.format(Math.round(value))} dongs` }

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value)
  const hash = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function App() {
  const [direction, setDirection] = useState<Direction>('EUR_VND')
  const [amount, setAmount] = useState('100')
  const [rate, setRate] = useState(() => Number(localStorage.getItem('dong-studio-rate')) || DEFAULT_RATE)
  const [rateDraft, setRateDraft] = useState(String(rate))
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [vaultOpen, setVaultOpen] = useState(false)
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState(false)
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('dong-studio-vault') === 'open')
  const [offline, setOffline] = useState(!navigator.onLine)
  const [saved, setSaved] = useState(false)

  const numericAmount = parseInput(amount)
  const result = direction === 'EUR_VND' ? numericAmount * rate : numericAmount / rate

  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine)
    window.addEventListener('online', sync)
    window.addEventListener('offline', sync)
    return () => {
      window.removeEventListener('online', sync)
      window.removeEventListener('offline', sync)
    }
  }, [])

  const formattedResult = useMemo(
    () => (direction === 'EUR_VND' ? dongNumber.format(Math.round(result)) : euroNumber.format(result)),
    [direction, result],
  )

  function switchDirection() {
    const previousResult = result
    setDirection((current) => (current === 'EUR_VND' ? 'VND_EUR' : 'EUR_VND'))
    setAmount(previousResult ? String(Math.round(previousResult * 100) / 100) : '')
  }

  function saveRate() {
    const next = Math.max(1, parseInput(rateDraft))
    setRate(next)
    setRateDraft(String(next))
    localStorage.setItem('dong-studio-rate', String(next))
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1800)
  }

  async function unlockVault(event: React.FormEvent) {
    event.preventDefault()
    const digest = await sha256(code)
    if (digest === ACCESS_DIGEST) {
      sessionStorage.setItem('dong-studio-vault', 'open')
      setUnlocked(true)
      setCode('')
      setCodeError(false)
    } else {
      setCodeError(true)
    }
  }

  return (
    <main className="min-h-screen pb-12 text-ink">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 md:px-8">
        <div className="flex items-center gap-3">
          <div className="logo-mark" aria-hidden="true">€</div>
          <div>
            <p className="font-semibold tracking-tight">Euro Dong</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">€ / DONGS</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`status-pill ${offline ? 'offline' : ''}`}>
            <span className="status-dot" />
            {offline ? 'Hors ligne' : 'Disponible hors ligne'}
          </div>
          <button className="icon-button" onClick={() => setSettingsOpen(true)} aria-label="Modifier le taux">
            <Settings2 size={18} />
          </button>
        </div>
      </nav>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pt-4 md:px-8 md:pt-7">
        <div className="mb-5 max-w-3xl">
          <div className="eyebrow"><Sparkles size={13} /> Taux libre, conversion instantanée</div>
          <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.045em] sm:text-4xl">
            Convertisseur <span className="text-gradient">€ ↔ dongs</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Saisissez un montant. Le résultat est immédiat, avec votre propre taux.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.12fr_.88fr]">
          <section className="card converter-card">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="section-kicker">Convertisseur</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">Combien cela fait ?</h2>
              </div>
              <button className="rate-chip" onClick={() => setSettingsOpen(true)}>
                <RefreshCw size={13} /> 1 € = {rate.toLocaleString('fr-FR')} dongs
              </button>
            </div>

            <div className="exchange-stack">
              <label className="money-field">
                <span>Vous avez</span>
                <div className="flex items-end gap-3">
                  <input
                    inputMode="decimal"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    aria-label="Montant à convertir"
                  />
                  <b>{direction === 'EUR_VND' ? '€' : 'dongs'}</b>
                </div>
              </label>

              <button className="swap-button" onClick={switchDirection} aria-label="Inverser les devises">
                <ArrowDownUp size={20} />
              </button>

              <div className="money-field result-field">
                <span>Vous obtenez</span>
                <div className="flex min-w-0 items-end gap-3">
                  <output title={formattedResult}>{formattedResult.replace(/\s/g, ' ')}</output>
                  <b>{direction === 'EUR_VND' ? 'dongs' : '€'}</b>
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <span>Calcul basé sur votre taux enregistré</span>
              <button className="text-link" onClick={() => setSettingsOpen(true)}>Ajuster le taux <ArrowRight size={14} /></button>
            </div>
          </section>

          <section className="card px-5 py-6 sm:px-7 sm:py-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-kicker">Repères express</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">Les montants utiles</h2>
              </div>
              <span className="flag-badge">€ <ArrowRight size={12} /> dongs</span>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {COMMON_EUR.map((value) => (
                <button
                  className="quick-tile"
                  key={value}
                  onClick={() => {
                    setDirection('EUR_VND')
                    setAmount(String(value))
                  }}
                >
                  <span>{formatEuros(value)}</span>
                  <strong>{formatDongs(value * rate)}</strong>
                  <ChevronRight size={15} />
                </button>
              ))}
            </div>
          </section>
        </div>

        <section className="vault-banner mt-5">
          <div className="vault-icon"><Files size={23} /></div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold">Coffre documents</p>
              <span className="secure-tag"><ShieldCheck size={12} /> accès verrouillé</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">Votre dossier Drive, accessible en deux gestes.</p>
          </div>
          <button className="primary-button" onClick={() => setVaultOpen(true)}>
            <LockKeyhole size={16} /> Accéder
          </button>
        </section>

        <footer className="mt-8 flex flex-col justify-between gap-3 border-t border-slate-300/60 pt-5 text-xs text-slate-500 sm:flex-row">
          <p>Euro Dong · Vos réglages restent sur cet appareil.</p>
          <p>Le taux affiché est indicatif et personnalisable.</p>
        </footer>
      </section>

      {settingsOpen && (
        <div className="modal-shell" role="dialog" aria-modal="true" aria-labelledby="rate-title">
          <button className="modal-backdrop" onClick={() => setSettingsOpen(false)} aria-label="Fermer" />
          <section className="modal-card">
            <button className="modal-close" onClick={() => setSettingsOpen(false)} aria-label="Fermer"><X size={18} /></button>
            <div className="modal-icon"><RefreshCw size={22} /></div>
            <p className="section-kicker">Réglage personnel</p>
            <h2 id="rate-title" className="mt-2 text-3xl font-semibold tracking-tight">Votre taux de change</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">Indiquez combien de dongs valent un euro. Ce taux sera mémorisé sur cet appareil.</p>
            <label className="mt-6 block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">1 EUR équivaut à</span>
              <div className="rate-input-wrap">
                <input inputMode="numeric" value={rateDraft} onChange={(event) => setRateDraft(event.target.value)} />
                <span>dongs</span>
              </div>
            </label>
            <button className="primary-button mt-4 w-full justify-center" onClick={saveRate}>
              {saved ? <><Check size={17} /> Taux enregistré</> : 'Enregistrer le taux'}
            </button>
            <button className="secondary-button mt-2 w-full" onClick={() => setRateDraft(String(DEFAULT_RATE))}>Revenir au taux par défaut</button>
          </section>
        </div>
      )}

      {vaultOpen && (
        <div className="modal-shell" role="dialog" aria-modal="true" aria-labelledby="vault-title">
          <button className="modal-backdrop" onClick={() => setVaultOpen(false)} aria-label="Fermer" />
          <section className="modal-card">
            <button className="modal-close" onClick={() => setVaultOpen(false)} aria-label="Fermer"><X size={18} /></button>
            {!unlocked ? (
              <form onSubmit={unlockVault}>
                <div className="modal-icon"><KeyRound size={22} /></div>
                <p className="section-kicker">Espace privé</p>
                <h2 id="vault-title" className="mt-2 text-3xl font-semibold tracking-tight">Déverrouiller le coffre</h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">Saisissez votre code à 4 chiffres pour afficher le raccourci Drive.</p>
                <label className="mt-6 block">
                  <span className="sr-only">Code d’accès</span>
                  <input
                    className={`pin-input ${codeError ? 'error' : ''}`}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    value={code}
                    onChange={(event) => {
                      setCode(event.target.value.replace(/\D/g, ''))
                      setCodeError(false)
                    }}
                    placeholder="••••"
                    autoFocus
                  />
                </label>
                {codeError && <p className="mt-2 text-center text-xs font-semibold text-red-600">Code incorrect. Réessayez.</p>}
                <button className="primary-button mt-4 w-full justify-center" type="submit">Déverrouiller <ArrowRight size={16} /></button>
                <p className="mt-4 text-center text-[11px] leading-4 text-slate-400">Ce verrou protège l’affichage sur cet appareil. Il ne remplace pas les permissions Google Drive.</p>
              </form>
            ) : (
              <div>
                <div className="modal-icon success"><Check size={22} /></div>
                <p className="section-kicker">Coffre ouvert</p>
                <h2 id="vault-title" className="mt-2 text-3xl font-semibold tracking-tight">Vos documents</h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">Le dossier s’ouvrira dans Google Drive avec les droits du compte Google connecté.</p>
                <a className="drive-card mt-6" href={PCLOUD_URL} target="_blank" rel="noreferrer">
                  <span className="drive-logo pcloud"><Download size={22} /></span>
                  <span className="flex-1"><b>Dossier pCloud</b><small>Ouvrir le lien partagé</small></span>
                  <ExternalLink size={17} />
                </a>
                <a className="drive-card mt-2" href={DRIVE_URL} target="_blank" rel="noreferrer">
                  <span className="drive-logo"><Cloud size={22} /></span>
                  <span className="flex-1"><b>Dossier Google Drive</b><small>Ouvrir dans un nouvel onglet</small></span>
                  <ExternalLink size={17} />
                </a>
                <div className="offline-note mt-4">
                  <WifiOff size={17} />
                  <p><b>Pour un vrai accès hors ligne</b><br />Le lien public pCloud nécessite internet. Dans l’app pCloud, ajoutez les fichiers ou dossiers à votre compte puis choisissez « Rendre disponible hors ligne ». Sur ordinateur, utilisez la synchronisation pCloud.</p>
                </div>
                <button className="secondary-button mt-4 w-full" onClick={() => {
                  sessionStorage.removeItem('dong-studio-vault')
                  setUnlocked(false)
                }}><LockKeyhole size={15} /> Reverrouiller</button>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  )
}

export default App
