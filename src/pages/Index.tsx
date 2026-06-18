import { useState } from 'react';
import Icon from '@/components/ui/icon';

const NAV = [
  { id: 'dashboard', label: 'Панель', icon: 'LayoutDashboard' },
  { id: 'campaigns', label: 'Кампании', icon: 'Rocket' },
  { id: 'platforms', label: 'Платформы', icon: 'Plug' },
  { id: 'analytics', label: 'Аналитика', icon: 'BarChart3' },
  { id: 'accounts', label: 'Аккаунты', icon: 'Users' },
  { id: 'profile', label: 'Профиль', icon: 'CircleUser' },
];

const PLATFORMS = [
  { name: 'YouTube', icon: 'Youtube', color: 'text-red-500', live: 3, status: 'Активно' },
  { name: 'Twitch', icon: 'Twitch', color: 'text-purple-400', live: 2, status: 'Активно' },
  { name: 'Kick', icon: 'Zap', color: 'text-green-400', live: 0, status: 'Готово' },
];

const STATS = [
  { label: 'Зрителей онлайн', value: '12 847', delta: '+18%', icon: 'Eye', up: true },
  { label: 'Активных чат-ботов', value: '364', delta: '+42', icon: 'Bot', up: true },
  { label: 'Кампаний в работе', value: '7', delta: '2 в очереди', icon: 'Rocket', up: true },
  { label: 'Сообщений в чат', value: '28 109', delta: '+9%', icon: 'MessageSquare', up: true },
];

const PLATFORM_META: Record<string, { icon: string; color: string }> = {
  YouTube: { icon: 'Youtube', color: 'text-red-500' },
  Twitch: { icon: 'Twitch', color: 'text-purple-400' },
  Kick: { icon: 'Zap', color: 'text-green-400' },
};

type Campaign = {
  id: number; name: string; platform: string; icon: string;
  viewers: number; bots: number; progress: number; state: string;
};

type Scheduled = { time: string; name: string; platform: string; dur: string };

const INITIAL_CAMPAIGNS: Campaign[] = [
  { id: 1, name: 'Вечерний стрим Dota 2', platform: 'Twitch', icon: 'Twitch', viewers: 4200, bots: 120, progress: 76, state: 'live' },
  { id: 2, name: 'Премьера клипа', platform: 'YouTube', icon: 'Youtube', viewers: 6800, bots: 90, progress: 54, state: 'live' },
  { id: 3, name: 'Турнир CS2 финал', platform: 'Kick', icon: 'Zap', viewers: 0, bots: 0, progress: 0, state: 'scheduled' },
  { id: 4, name: 'Утренний подкаст', platform: 'YouTube', icon: 'Youtube', viewers: 1850, bots: 54, progress: 31, state: 'live' },
];

const INITIAL_SCHEDULE: Scheduled[] = [
  { time: '18:00', name: 'Турнир CS2 финал', platform: 'Kick', dur: '3 ч' },
  { time: '20:30', name: 'Стрим General', platform: 'Twitch', dur: '2 ч' },
  { time: '22:00', name: 'Премьера трейлера', platform: 'YouTube', dur: '45 мин' },
  { time: 'Завтра 12:00', name: 'Дневной марафон', platform: 'Twitch', dur: '6 ч' },
];

const EMPTY_FORM = { name: '', platform: 'Twitch', viewers: 1000, bots: 50, time: '', dur: '2 ч' };
let nextId = 5;

// Analytics data
const HOURS = ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22'];

const VIEWERS_DATA: Record<string, number[]> = {
  YouTube: [1200, 980, 700, 450, 890, 2100, 4800, 6200, 6800, 7400, 5900, 3200],
  Twitch:  [800,  600, 420, 310, 550, 1400, 2800, 3900, 4200, 5100, 4800, 2900],
  Kick:    [200,  150, 90,  60,  180, 540,  1100, 1800, 2300, 2100, 1600, 900],
};

const BOTS_DATA: Record<string, number[]> = {
  YouTube: [40, 32, 22, 15, 28, 68, 145, 192, 210, 224, 180, 100],
  Twitch:  [28, 20, 14, 10, 18, 46, 90,  128, 138, 164, 154, 92],
  Kick:    [8,  6,  4,  2,  6,  18, 36,  58,  74,  68,  52, 30],
};

const PLATFORM_COLORS: Record<string, string> = {
  YouTube: '#ef4444',
  Twitch: '#a855f7',
  Kick: '#22c55e',
};

const ANALYTICS_STATS = [
  { label: 'Пиковые зрители', value: '7 400', sub: 'сегодня в 18:00', icon: 'TrendingUp' },
  { label: 'Всего зрителей', value: '42 190', sub: 'за 7 дней', icon: 'Eye' },
  { label: 'Сообщений ботов', value: '184 320', sub: 'за 7 дней', icon: 'MessageSquare' },
  { label: 'Ср. удержание', value: '73%', sub: 'время в эфире', icon: 'Timer' },
];

// Tiny SVG sparkline chart helper
function Sparkline({ data, color, height = 60 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const w = 300; const h = height;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 8) - 4;
    return `${x},${y}`;
  });
  const area = `M${pts[0]} ` + pts.slice(1).map((p) => `L${p}`).join(' ') + ` L${w},${h} L0,${h} Z`;
  const line = `M${pts[0]} ` + pts.slice(1).map((p) => `L${p}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
      <defs>
        <linearGradient id={`g-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#g-${color.replace('#','')})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Accounts data
type Account = {
  id: number; platform: string; username: string; avatar: string;
  status: 'active' | 'paused' | 'error'; campaigns: number; viewers: number; added: string;
};

let nextAccId = 6;
const GRADIENT_AVATARS = [
  'from-violet-500 to-pink-500',
  'from-red-500 to-orange-400',
  'from-emerald-500 to-teal-400',
  'from-blue-500 to-cyan-400',
  'from-amber-500 to-yellow-400',
];

const INITIAL_ACCOUNTS: Account[] = [
  { id: 1, platform: 'YouTube', username: '@ProStreamer_YT', avatar: 'from-red-500 to-orange-400', status: 'active', campaigns: 3, viewers: 8650, added: '12 июн' },
  { id: 2, platform: 'YouTube', username: '@GamingHub_RU',  avatar: 'from-pink-500 to-rose-400',  status: 'active', campaigns: 1, viewers: 2100, added: '14 июн' },
  { id: 3, platform: 'Twitch',  username: 'streamer_twitch', avatar: 'from-violet-500 to-purple-400', status: 'active', campaigns: 2, viewers: 4200, added: '10 июн' },
  { id: 4, platform: 'Twitch',  username: 'kick_master_pro', avatar: 'from-blue-500 to-indigo-400',  status: 'paused', campaigns: 0, viewers: 0,    added: '8 июн' },
  { id: 5, platform: 'Kick',    username: 'KickLive_Pro',    avatar: 'from-emerald-500 to-green-400', status: 'error',  campaigns: 0, viewers: 0,    added: '5 июн' },
];

const EMPTY_ACC_FORM = { platform: 'YouTube', username: '' };

const STATUS_ACC: Record<string, { label: string; cls: string; dot: string }> = {
  active: { label: 'Активен',  cls: 'text-accent bg-accent/10',       dot: 'bg-accent' },
  paused: { label: 'Пауза',    cls: 'text-yellow-400 bg-yellow-400/10', dot: 'bg-yellow-400' },
  error:  { label: 'Ошибка',   cls: 'text-destructive bg-destructive/10', dot: 'bg-destructive' },
};

// Platform card component
type PlatformDef = {
  name: string; icon: string; color: string; bg: string; border: string; accent: string;
  connected: boolean; desc: string; features: string[];
  stats: { viewers: string; bots: string; campaigns: number };
  settings: { label: string; sub: string; on: boolean }[];
};

function PlatformCard({ platform: p }: { platform: PlatformDef }) {
  const [connected, setConnected] = useState(p.connected);
  const [open, setOpen] = useState(false);

  return (
    <div className={`rounded-2xl border bg-card overflow-hidden transition-colors ${connected ? p.border : 'border-border'}`}>
      {/* Header */}
      <div className={`p-5 bg-gradient-to-r ${p.bg} flex items-center gap-4`}>
        <div className="h-12 w-12 rounded-xl bg-card/80 grid place-items-center shrink-0 border border-border">
          <Icon name={p.icon} size={26} className={p.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">{p.name}</span>
            {connected
              ? <span className="text-xs font-semibold text-accent bg-accent/10 px-2.5 py-0.5 rounded-full flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-accent pulse-dot" />Подключено</span>
              : <span className="text-xs font-semibold text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full">Не подключено</span>
            }
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {connected && (
            <button onClick={() => setOpen((v) => !v)}
              className="h-9 w-9 rounded-xl border border-border bg-card/60 grid place-items-center hover:bg-secondary transition">
              <Icon name={open ? 'ChevronUp' : 'Settings2'} size={16} className="text-muted-foreground" />
            </button>
          )}
          <button
            onClick={() => setConnected((v) => !v)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${connected ? 'border border-border bg-card/60 text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40' : 'bg-primary text-primary-foreground hover:opacity-90'}`}>
            {connected ? 'Отключить' : 'Подключить'}
          </button>
        </div>
      </div>

      {/* Stats row */}
      {connected && (
        <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
          {[
            { label: 'Зрителей', value: p.stats.viewers, icon: 'Eye' },
            { label: 'Чат-ботов', value: p.stats.bots, icon: 'Bot' },
            { label: 'Кампаний', value: String(p.stats.campaigns), icon: 'Rocket' },
          ].map((s) => (
            <div key={s.label} className="p-4 flex items-center gap-3">
              <Icon name={s.icon} size={16} className="text-muted-foreground shrink-0" />
              <div>
                <div className="font-mono-num font-bold" style={{ color: p.accent }}>{s.value}</div>
                <div className="text-[10px] text-muted-foreground">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Features */}
      <div className="px-5 py-3 flex flex-wrap gap-2 border-t border-border">
        {p.features.map((f) => (
          <span key={f} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-secondary text-muted-foreground flex items-center gap-1">
            <Icon name="Check" size={11} className={connected ? p.color : ''} /> {f}
          </span>
        ))}
      </div>

      {/* Settings panel */}
      {open && connected && (
        <div className="border-t border-border divide-y divide-border">
          <div className="px-5 py-3 flex items-center gap-2">
            <Icon name="SlidersHorizontal" size={14} className="text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Настройки платформы</span>
          </div>
          {p.settings.map((s) => (
            <SettingsRow key={s.label} label={s.label} sub={s.sub} icon="ToggleRight" on={s.on} />
          ))}
        </div>
      )}
    </div>
  );
}

// Settings toggle row
function SettingsRow({ label, sub, icon, on }: { label: string; sub: string; icon: string; on: boolean }) {
  const [enabled, setEnabled] = useState(on);
  return (
    <div className="flex items-center gap-4 p-5 hover:bg-secondary/30 transition-colors">
      <div className="h-9 w-9 rounded-xl bg-secondary grid place-items-center shrink-0">
        <Icon name={icon} size={16} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
      </div>
      <button
        onClick={() => setEnabled((v) => !v)}
        className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${enabled ? 'bg-primary' : 'bg-secondary border border-border'}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

// Bar chart
function BarChart({ data, color, labels }: { data: number[]; color: string; labels: string[] }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-1 h-24 w-full">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
          <div
            className="w-full rounded-t-sm transition-all duration-300"
            style={{ height: `${(v / max) * 100}%`, backgroundColor: color, opacity: 0.75 }}
          />
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block text-[10px] font-mono-num bg-card border border-border px-1.5 py-0.5 rounded whitespace-nowrap z-10">
            {v.toLocaleString('ru')}
          </div>
          {i % 2 === 0 && <span className="text-[9px] text-muted-foreground">{labels[i]}</span>}
        </div>
      ))}
    </div>
  );
}

const Index = () => {
  const [active, setActive] = useState('dashboard');
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [schedule, setSchedule] = useState<Scheduled[]>(INITIAL_SCHEDULE);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'day' | 'week'>('day');
  const [activePlatforms, setActivePlatforms] = useState<string[]>(['YouTube', 'Twitch', 'Kick']);
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [accModal, setAccModal] = useState(false);
  const [accForm, setAccForm] = useState({ ...EMPTY_ACC_FORM });
  const [filterPlatform, setFilterPlatform] = useState<string>('Все');

  const togglePlatform = (p: string) =>
    setActivePlatforms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);

  const addAccount = () => {
    if (!accForm.username.trim()) return;
    setAccounts((prev) => [
      {
        id: nextAccId++,
        platform: accForm.platform,
        username: accForm.username.trim(),
        avatar: GRADIENT_AVATARS[Math.floor(Math.random() * GRADIENT_AVATARS.length)],
        status: 'active',
        campaigns: 0,
        viewers: 0,
        added: new Date().toLocaleDateString('ru', { day: 'numeric', month: 'короткий' }).replace('.', ''),
      },
      ...prev,
    ]);
    setAccModal(false);
  };

  const toggleAccStatus = (id: number) => {
    setAccounts((prev) => prev.map((a) =>
      a.id === id ? { ...a, status: a.status === 'active' ? 'paused' : 'active' } : a
    ));
  };

  const deleteAccount = (id: number) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  const filteredAccounts = filterPlatform === 'Все' ? accounts : accounts.filter((a) => a.platform === filterPlatform);

  const openModal = () => { setForm({ ...EMPTY_FORM }); setModalOpen(true); };

  const submitCampaign = () => {
    if (!form.name.trim()) return;
    const meta = PLATFORM_META[form.platform];
    const scheduled = form.time.trim().length > 0;
    setCampaigns((prev) => [
      {
        id: nextId++,
        name: form.name.trim(),
        platform: form.platform,
        icon: meta.icon,
        viewers: scheduled ? 0 : Number(form.viewers),
        bots: scheduled ? 0 : Number(form.bots),
        progress: scheduled ? 0 : 5,
        state: scheduled ? 'scheduled' : 'live',
      },
      ...prev,
    ]);
    if (scheduled) {
      setSchedule((prev) => [
        { time: form.time.trim(), name: form.name.trim(), platform: form.platform, dur: form.dur },
        ...prev,
      ]);
    }
    setModalOpen(false);
  };

  const pauseCampaign = (id: number) => {
    setCampaigns((prev) =>
      prev.map((c) => c.id === id ? { ...c, state: c.state === 'paused' ? 'live' : 'paused' } : c)
    );
  };

  const stopCampaign = (id: number) => {
    setCampaigns((prev) =>
      prev.map((c) => c.id === id ? { ...c, state: 'stopped', viewers: 0, bots: 0, progress: 100 } : c)
    );
  };

  const deleteCampaign = (id: number) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="min-h-screen flex text-foreground">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-border glass sticky top-0 h-screen p-5">
        <div className="flex items-center gap-2.5 px-2 mb-9">
          <div className="h-9 w-9 rounded-xl bg-primary grid place-items-center shadow-lg shadow-primary/30">
            <Icon name="Radio" size={20} className="text-primary-foreground" />
          </div>
          <div className="leading-none">
            <div className="font-extrabold tracking-tight text-lg">RBTools</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">control center</div>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setActive(n.id)}
              className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active === n.id
                  ? 'bg-primary/15 text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}
            >
              <Icon name={n.icon} size={18} className={active === n.id ? 'text-primary' : ''} />
              {n.label}
              {active === n.id && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
            </button>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border border-border p-4 bg-secondary/40">
          <div className="flex items-center gap-2 text-xs text-accent font-semibold mb-1">
            <Icon name="Crown" size={14} /> PRO активен
          </div>
          <p className="text-xs text-muted-foreground mb-3">Безлимит кампаний и ботов</p>
          <button className="w-full text-xs font-semibold py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition">
            Управлять подпиской
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-10 glass border-b border-border px-5 sm:px-8 py-4 flex items-center gap-4">
          <div className="md:hidden h-8 w-8 rounded-lg bg-primary grid place-items-center">
            <Icon name="Radio" size={16} className="text-primary-foreground" />
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <span className="h-2 w-2 rounded-full bg-accent pulse-dot" />
            <span className="text-muted-foreground">Все системы в норме</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="relative h-10 w-10 grid place-items-center rounded-xl border border-border hover:bg-secondary/60 transition">
              <Icon name="Bell" size={18} />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
            </button>
            <button className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border border-border hover:bg-secondary/60 transition">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-accent" />
              <span className="text-sm font-medium hidden sm:block">Алексей</span>
            </button>
          </div>
        </header>

        <div className="p-5 sm:p-8 space-y-8 max-w-[1400px]">

          {/* ─── ANALYTICS ─── */}
          {active === 'analytics' && (
            <div className="space-y-8 animate-fade-in-up">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Аналитика</h1>
                  <p className="text-muted-foreground mt-1">Графики зрителей и активности чат-ботов по времени.</p>
                </div>
                <div className="sm:ml-auto flex gap-2">
                  {(['day', 'week'] as const).map((p) => (
                    <button key={p} onClick={() => setAnalyticsPeriod(p)}
                      className={`text-sm font-semibold px-4 py-2 rounded-xl border transition ${analyticsPeriod === p ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-secondary/60'}`}>
                      {p === 'day' ? 'Сегодня' : '7 дней'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {ANALYTICS_STATS.map((s) => (
                  <div key={s.label} className="rounded-2xl border border-border bg-card p-5 hover:border-primary/40 transition-colors">
                    <div className="h-9 w-9 rounded-xl bg-secondary grid place-items-center mb-4">
                      <Icon name={s.icon} size={18} className="text-primary" />
                    </div>
                    <div className="font-mono-num text-2xl font-bold">{s.value}</div>
                    <div className="text-sm font-medium mt-0.5">{s.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Platform toggle */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">Платформы:</span>
                {(['YouTube', 'Twitch', 'Kick'] as const).map((p) => (
                  <button key={p} onClick={() => togglePlatform(p)}
                    className={`flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-lg border transition ${activePlatforms.includes(p) ? 'border-transparent text-foreground' : 'border-border text-muted-foreground opacity-50'}`}
                    style={activePlatforms.includes(p) ? { backgroundColor: PLATFORM_COLORS[p] + '22', borderColor: PLATFORM_COLORS[p] + '66' } : {}}>
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PLATFORM_COLORS[p] }} />
                    {p}
                  </button>
                ))}
              </div>

              {/* Viewers chart */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Icon name="Eye" size={18} className="text-primary" />
                  <h2 className="font-semibold">Зрители по времени</h2>
                  <span className="ml-auto font-mono-num text-xs text-muted-foreground">пик 7 400</span>
                </div>
                <div className="space-y-3">
                  {(['YouTube', 'Twitch', 'Kick'] as const).filter((p) => activePlatforms.includes(p)).map((p) => (
                    <div key={p}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PLATFORM_COLORS[p] }} />
                        <span className="text-xs font-semibold text-muted-foreground">{p}</span>
                        <span className="ml-auto font-mono-num text-xs text-muted-foreground">
                          {Math.max(...VIEWERS_DATA[p]).toLocaleString('ru')} пик
                        </span>
                      </div>
                      <Sparkline data={VIEWERS_DATA[p]} color={PLATFORM_COLORS[p]} height={56} />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 px-1">
                  {HOURS.map((h) => (
                    <span key={h} className="text-[10px] text-muted-foreground">{h}:00</span>
                  ))}
                </div>
              </div>

              {/* Bots chart */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Icon name="Bot" size={18} className="text-primary" />
                    <h2 className="font-semibold">Активность чат-ботов</h2>
                  </div>
                  <div className="space-y-4">
                    {(['YouTube', 'Twitch', 'Kick'] as const).filter((p) => activePlatforms.includes(p)).map((p) => (
                      <div key={p}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PLATFORM_COLORS[p] }} />
                          <span className="text-xs font-semibold text-muted-foreground">{p}</span>
                          <span className="ml-auto font-mono-num text-xs text-muted-foreground">
                            {Math.max(...BOTS_DATA[p])} макс
                          </span>
                        </div>
                        <BarChart data={BOTS_DATA[p]} color={PLATFORM_COLORS[p]} labels={HOURS} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Platform breakdown */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Icon name="PieChart" size={18} className="text-primary" />
                    <h2 className="font-semibold">Распределение зрителей</h2>
                  </div>
                  <div className="space-y-4">
                    {(['YouTube', 'Twitch', 'Kick'] as const).map((p) => {
                      const total = Object.values(VIEWERS_DATA).flat().reduce((a, b) => a + b, 0);
                      const pTotal = VIEWERS_DATA[p].reduce((a, b) => a + b, 0);
                      const pct = Math.round((pTotal / total) * 100);
                      return (
                        <div key={p}>
                          <div className="flex items-center gap-2 mb-2">
                            <Icon name={PLATFORM_META[p].icon} size={16} className={PLATFORM_META[p].color} />
                            <span className="text-sm font-medium">{p}</span>
                            <span className="ml-auto font-mono-num text-sm font-bold">{pct}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-secondary overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, backgroundColor: PLATFORM_COLORS[p] }} />
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {pTotal.toLocaleString('ru')} зрителей суммарно
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 pt-5 border-t border-border space-y-2">
                    <div className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mb-3">Топ кампании</div>
                    {campaigns.filter((c) => c.state === 'live').slice(0, 3).map((c) => (
                      <div key={c.id} className="flex items-center gap-2">
                        <Icon name={c.icon} size={14} />
                        <span className="text-sm truncate flex-1">{c.name}</span>
                        <span className="font-mono-num text-xs font-bold text-accent">{c.viewers.toLocaleString('ru')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── ACCOUNTS ─── */}
          {active === 'accounts' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Аккаунты</h1>
                  <p className="text-muted-foreground mt-1">Управляйте подключёнными аккаунтами на платформах.</p>
                </div>
                <button onClick={() => { setAccForm({ ...EMPTY_ACC_FORM }); setAccModal(true); }}
                  className="sm:ml-auto flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition shrink-0">
                  <Icon name="Plus" size={16} /> Добавить аккаунт
                </button>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-4">
                {(['YouTube', 'Twitch', 'Kick'] as const).map((p) => {
                  const pAccs = accounts.filter((a) => a.platform === p);
                  return (
                    <div key={p} className="rounded-2xl border border-border bg-card p-4 hover:border-primary/40 transition-colors">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon name={PLATFORM_META[p].icon} size={18} className={PLATFORM_META[p].color} />
                        <span className="font-semibold">{p}</span>
                      </div>
                      <div className="font-mono-num text-2xl font-bold">{pAccs.length}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {pAccs.filter((a) => a.status === 'active').length} активных
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Filter tabs */}
              <div className="flex gap-2 flex-wrap">
                {['Все', 'YouTube', 'Twitch', 'Kick'].map((f) => (
                  <button key={f} onClick={() => setFilterPlatform(f)}
                    className={`text-sm font-semibold px-3.5 py-1.5 rounded-xl border transition ${filterPlatform === f ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-secondary/60'}`}>
                    {f} {f !== 'Все' && <span className="font-mono-num ml-1 opacity-60">{accounts.filter((a) => a.platform === f).length}</span>}
                  </button>
                ))}
              </div>

              {/* Account list */}
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                {filteredAccounts.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
                    <Icon name="Users" size={36} />
                    <p className="text-sm">Нет аккаунтов. Добавьте первый!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredAccounts.map((a) => {
                      const s = STATUS_ACC[a.status];
                      return (
                        <div key={a.id} className="p-5 flex items-center gap-4 hover:bg-secondary/30 transition-colors group">
                          {/* Avatar */}
                          <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${a.avatar} shrink-0 grid place-items-center font-bold text-white text-sm`}>
                            {a.username.replace('@', '').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold truncate">{a.username}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Icon name={PLATFORM_META[a.platform].icon} size={12} className={PLATFORM_META[a.platform].color} />
                              <span className="text-xs text-muted-foreground">{a.platform}</span>
                              <span className="text-xs text-muted-foreground">· добавлен {a.added}</span>
                            </div>
                          </div>
                          <div className="hidden sm:flex flex-col items-end gap-1 shrink-0 w-32">
                            <div className="font-mono-num text-sm font-bold">{a.viewers.toLocaleString('ru')}</div>
                            <div className="text-xs text-muted-foreground">{a.campaigns} кампаний</div>
                          </div>
                          <span className={`shrink-0 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${s.cls}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${s.dot} ${a.status === 'active' ? 'pulse-dot' : ''}`} />
                            {s.label}
                          </span>
                          <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => toggleAccStatus(a.id)} title={a.status === 'active' ? 'Пауза' : 'Активировать'}
                              className="h-8 w-8 rounded-lg border border-border grid place-items-center hover:bg-secondary transition">
                              <Icon name={a.status === 'active' ? 'Pause' : 'Play'} size={14} className="text-muted-foreground" />
                            </button>
                            <button onClick={() => deleteAccount(a.id)} title="Удалить"
                              className="h-8 w-8 rounded-lg border border-border grid place-items-center hover:bg-destructive/10 transition">
                              <Icon name="Trash2" size={14} className="text-destructive" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modal: Add account */}
          {accModal && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-background/70 backdrop-blur-sm animate-fade-in-up"
              onClick={() => setAccModal(false)}>
              <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-border bg-card p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-9 w-9 rounded-xl bg-primary/15 grid place-items-center">
                    <Icon name="UserPlus" size={18} className="text-primary" />
                  </div>
                  <h2 className="font-bold text-lg">Добавить аккаунт</h2>
                  <button onClick={() => setAccModal(false)} className="ml-auto h-8 w-8 grid place-items-center rounded-lg hover:bg-secondary transition">
                    <Icon name="X" size={18} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Платформа</label>
                    <div className="mt-1.5 grid grid-cols-3 gap-2">
                      {(['YouTube', 'Twitch', 'Kick'] as const).map((p) => (
                        <button key={p} onClick={() => setAccForm({ ...accForm, platform: p })}
                          className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-semibold transition ${accForm.platform === p ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:bg-secondary/60'}`}>
                          <Icon name={PLATFORM_META[p].icon} size={20} className={PLATFORM_META[p].color} />
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Имя пользователя / канал</label>
                    <input value={accForm.username} onChange={(e) => setAccForm({ ...accForm, username: e.target.value })}
                      placeholder={accForm.platform === 'YouTube' ? '@YourChannel' : 'your_username'}
                      className="mt-1.5 w-full rounded-xl bg-secondary/60 border border-border px-3.5 py-2.5 text-sm outline-none focus:border-primary transition"
                      onKeyDown={(e) => e.key === 'Enter' && addAccount()} />
                  </div>
                  <div className="rounded-xl border border-border bg-secondary/30 p-3.5 flex gap-2.5">
                    <Icon name="Info" size={16} className="text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">После добавления аккаунт появится в списке. Авторизация платформы — следующий шаг.</p>
                  </div>
                  <div className="flex gap-2.5 pt-1">
                    <button onClick={() => setAccModal(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-secondary/60 transition">
                      Отмена
                    </button>
                    <button onClick={addAccount} disabled={!accForm.username.trim()}
                      className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
                      <Icon name="UserPlus" size={16} /> Добавить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── DASHBOARD ─── */}
          {active !== 'analytics' && active !== 'accounts' && <>
          {/* Hero */}
          <section className="animate-fade-in-up">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Центр управления накруткой
            </h1>
            <p className="text-muted-foreground mt-2">
              Запускайте зрителей и чат-ботов на YouTube, Twitch и Kick по расписанию.
            </p>
          </section>

          {/* Stats */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className="rounded-2xl border border-border bg-card p-5 animate-fade-in-up hover:border-primary/40 transition-colors"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-9 w-9 rounded-xl bg-secondary grid place-items-center">
                    <Icon name={s.icon} size={18} className="text-primary" />
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-md ${s.up ? 'text-accent bg-accent/10' : 'text-muted-foreground bg-secondary'}`}>
                    {s.delta}
                  </span>
                </div>
                <div className="font-mono-num text-2xl sm:text-3xl font-bold tracking-tight">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </section>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Campaigns */}
            <section className="lg:col-span-2 rounded-2xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <div className="flex items-center gap-2">
                  <Icon name="Rocket" size={18} className="text-primary" />
                  <h2 className="font-semibold">Активные кампании</h2>
                </div>
                <button onClick={openModal} className="flex items-center gap-1.5 text-sm font-semibold px-3.5 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition">
                  <Icon name="Plus" size={16} /> Новая
                </button>
              </div>
              <div className="divide-y divide-border">
                {campaigns.map((c) => {
                  const isLive = c.state === 'live';
                  const isPaused = c.state === 'paused';
                  const isStopped = c.state === 'stopped';
                  const isScheduled = c.state === 'scheduled';
                  return (
                    <div key={c.id} className="p-5 flex items-center gap-3 hover:bg-secondary/30 transition-colors group">
                      <div className="h-10 w-10 rounded-xl bg-secondary grid place-items-center shrink-0">
                        <Icon name={c.icon} size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`font-medium truncate ${isStopped ? 'text-muted-foreground line-through' : ''}`}>{c.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{c.platform}</div>
                        <div className="mt-2.5 h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              isLive ? 'bg-gradient-to-r from-primary to-accent'
                              : isPaused ? 'bg-yellow-500/70'
                              : isStopped ? 'bg-destructive/50'
                              : 'bg-muted'
                            }`}
                            style={{ width: `${c.progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="hidden sm:flex flex-col items-end gap-1 shrink-0 w-24">
                        {(isLive || isPaused) ? (
                          <>
                            <div className="font-mono-num font-bold">{c.viewers.toLocaleString('ru')}</div>
                            <div className="text-xs text-muted-foreground">{c.bots} ботов</div>
                          </>
                        ) : isScheduled ? (
                          <span className="text-xs font-semibold text-accent flex items-center gap-1">
                            <Icon name="Clock" size={13} /> В очереди
                          </span>
                        ) : null}
                      </div>
                      <div className="shrink-0 flex items-center gap-1">
                        {/* Status badge */}
                        <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                          isLive ? 'text-accent bg-accent/10'
                          : isPaused ? 'text-yellow-400 bg-yellow-400/10'
                          : isStopped ? 'text-destructive bg-destructive/10'
                          : 'text-muted-foreground bg-secondary'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            isLive ? 'bg-accent pulse-dot'
                            : isPaused ? 'bg-yellow-400'
                            : isStopped ? 'bg-destructive'
                            : 'bg-muted-foreground'
                          }`} />
                          {isLive ? 'LIVE' : isPaused ? 'Пауза' : isStopped ? 'Стоп' : 'Ждёт'}
                        </span>
                        {/* Action buttons — visible on hover */}
                        {!isStopped && (
                          <button
                            onClick={() => pauseCampaign(c.id)}
                            title={isPaused ? 'Возобновить' : 'Пауза'}
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-lg border border-border grid place-items-center hover:bg-secondary ml-1"
                          >
                            <Icon name={isPaused ? 'Play' : 'Pause'} size={14} className="text-muted-foreground" />
                          </button>
                        )}
                        {!isStopped && (
                          <button
                            onClick={() => stopCampaign(c.id)}
                            title="Остановить"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-lg border border-border grid place-items-center hover:bg-destructive/10"
                          >
                            <Icon name="Square" size={14} className="text-destructive" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteCampaign(c.id)}
                          title="Удалить"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-lg border border-border grid place-items-center hover:bg-destructive/10"
                        >
                          <Icon name="Trash2" size={14} className="text-destructive" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Schedule */}
            <section className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="flex items-center gap-2 p-5 border-b border-border">
                <Icon name="CalendarClock" size={18} className="text-primary" />
                <h2 className="font-semibold">Расписание</h2>
                <span className="ml-auto text-xs text-muted-foreground">авто-запуск</span>
              </div>
              <div className="p-5 space-y-3">
                {schedule.map((s) => (
                  <div key={s.name} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/30 hover:border-primary/40 transition-colors">
                    <div className="font-mono-num text-xs font-semibold text-primary w-20 shrink-0">{s.time}</div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.platform} · {s.dur}</div>
                    </div>
                    <Icon name="ChevronRight" size={16} className="text-muted-foreground shrink-0" />
                  </div>
                ))}
                <button onClick={openModal} className="w-full flex items-center justify-center gap-1.5 text-sm font-semibold py-2.5 rounded-xl border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition">
                  <Icon name="Plus" size={16} /> Запланировать кампанию
                </button>
              </div>
            </section>
          </div>

          {/* Platforms */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Icon name="Plug" size={18} className="text-primary" />
              <h2 className="font-semibold">Подключённые платформы</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {PLATFORMS.map((p) => (
                <div key={p.name} className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4 hover:border-primary/40 transition-colors grid-bg">
                  <div className="h-12 w-12 rounded-xl bg-secondary grid place-items-center shrink-0">
                    <Icon name={p.icon} size={24} className={p.color} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {p.live > 0 ? `${p.live} live-кампаний` : 'Готов к запуску'}
                    </div>
                  </div>
                  <span className="ml-auto text-xs font-semibold text-accent">{p.status}</span>
                </div>
              ))}
            </div>
          </section>
          </>}

          {/* ─── PLATFORMS ─── */}
          {active === 'platforms' && (
            <div className="space-y-6 animate-fade-in-up">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Платформы</h1>
                <p className="text-muted-foreground mt-1">Подключение и настройка сервисов для накрутки.</p>
              </div>

              {/* Platform cards */}
              <div className="grid gap-5">
                {[
                  {
                    name: 'YouTube',
                    icon: 'Youtube',
                    color: 'text-red-500',
                    bg: 'from-red-500/10 to-orange-500/5',
                    border: 'border-red-500/20',
                    accent: '#ef4444',
                    connected: true,
                    desc: 'Накрутка просмотров, лайков и комментариев через чат-ботов.',
                    features: ['Накрутка зрителей', 'Чат-боты', 'Лайки', 'Подписчики'],
                    stats: { viewers: '8 650', bots: '224', campaigns: 3 },
                    settings: [
                      { label: 'Случайные задержки', sub: 'Имитация живых зрителей', on: true },
                      { label: 'Авто-комментарии', sub: 'Боты пишут в чат по скрипту', on: true },
                      { label: 'Геофильтр', sub: 'Зрители только из РФ', on: false },
                    ],
                  },
                  {
                    name: 'Twitch',
                    icon: 'Twitch',
                    color: 'text-purple-400',
                    bg: 'from-purple-500/10 to-violet-500/5',
                    border: 'border-purple-500/20',
                    accent: '#a855f7',
                    connected: true,
                    desc: 'Накрутка зрителей и чат-активности для роста в категориях.',
                    features: ['Накрутка зрителей', 'Чат-боты', 'Фолловеры', 'Клипы'],
                    stats: { viewers: '4 200', bots: '164', campaigns: 2 },
                    settings: [
                      { label: 'Случайные задержки', sub: 'Имитация живых зрителей', on: true },
                      { label: 'Чат-активность', sub: 'Боты реагируют на события', on: false },
                      { label: 'Защита от бана', sub: 'Умный лимит в час', on: true },
                    ],
                  },
                  {
                    name: 'Kick',
                    icon: 'Zap',
                    color: 'text-green-400',
                    bg: 'from-green-500/10 to-emerald-500/5',
                    border: 'border-green-500/20',
                    accent: '#22c55e',
                    connected: false,
                    desc: 'Молодая платформа с высоким органическим охватом.',
                    features: ['Накрутка зрителей', 'Чат-боты', 'Фолловеры'],
                    stats: { viewers: '0', bots: '0', campaigns: 0 },
                    settings: [
                      { label: 'Случайные задержки', sub: 'Имитация живых зрителей', on: false },
                      { label: 'Чат-активность', sub: 'Боты реагируют на события', on: false },
                      { label: 'Геофильтр', sub: 'Зрители только из РФ', on: false },
                    ],
                  },
                ].map((p) => (
                  <PlatformCard key={p.name} platform={p} />
                ))}
              </div>
            </div>
          )}

          {/* ─── PROFILE ─── */}
          {active === 'profile' && (
            <div className="space-y-6 animate-fade-in-up max-w-2xl">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Профиль</h1>
                <p className="text-muted-foreground mt-1">Настройки аккаунта и управление подпиской.</p>
              </div>

              {/* User card */}
              <div className="rounded-2xl border border-border bg-card p-6 flex items-center gap-5">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent shrink-0 grid place-items-center text-white font-extrabold text-xl">
                  АК
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xl">Алексей Кузнецов</div>
                  <div className="text-sm text-muted-foreground mt-0.5">aleksey@example.com</div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Icon name="Crown" size={14} className="text-accent" />
                    <span className="text-xs font-semibold text-accent">PRO подписка</span>
                    <span className="text-xs text-muted-foreground">· активна до 19 июл 2026</span>
                  </div>
                </div>
                <button className="shrink-0 px-4 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-secondary/60 transition">
                  Изменить
                </button>
              </div>

              {/* Subscription */}
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="Crown" size={18} className="text-accent" />
                  <h2 className="font-semibold">Тарифный план — PRO</h2>
                  <span className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full text-accent bg-accent/10">Активен</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  {[
                    { label: 'Кампании', value: '∞', sub: 'безлимит' },
                    { label: 'Чат-боты', value: '∞', sub: 'безлимит' },
                    { label: 'Аккаунты', value: '50', sub: 'максимум' },
                    { label: 'Зрителей', value: '100K', sub: 'одновременно' },
                  ].map((f) => (
                    <div key={f.label} className="rounded-xl bg-card border border-border p-3 text-center">
                      <div className="font-mono-num font-bold text-lg text-accent">{f.value}</div>
                      <div className="text-xs font-semibold mt-0.5">{f.label}</div>
                      <div className="text-[10px] text-muted-foreground">{f.sub}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2.5">
                  <button className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition">
                    Продлить подписку
                  </button>
                  <button className="px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-secondary/60 transition">
                    История платежей
                  </button>
                </div>
              </div>

              {/* Settings */}
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="flex items-center gap-2 p-5 border-b border-border">
                  <Icon name="Settings" size={18} className="text-primary" />
                  <h2 className="font-semibold">Настройки</h2>
                </div>
                <div className="divide-y divide-border">
                  {[
                    { label: 'Уведомления о кампаниях', sub: 'Push при запуске и завершении', icon: 'Bell', on: true },
                    { label: 'Email-отчёты', sub: 'Еженедельная сводка на почту', icon: 'Mail', on: true },
                    { label: 'Авто-продление подписки', sub: 'Списание за 3 дня до окончания', icon: 'RefreshCw', on: false },
                    { label: 'Двухфакторная аутентификация', sub: 'SMS или приложение', icon: 'ShieldCheck', on: false },
                  ].map((item) => (
                    <SettingsRow key={item.label} {...item} />
                  ))}
                </div>
              </div>

              {/* Danger zone */}
              <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="AlertTriangle" size={16} className="text-destructive" />
                  <span className="text-sm font-semibold text-destructive">Опасная зона</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">Эти действия необратимы. Будьте осторожны.</p>
                <div className="flex gap-2.5 flex-wrap">
                  <button className="text-sm font-semibold px-4 py-2 rounded-xl border border-destructive/40 text-destructive hover:bg-destructive/10 transition">
                    Сбросить все данные
                  </button>
                  <button className="text-sm font-semibold px-4 py-2 rounded-xl border border-destructive/40 text-destructive hover:bg-destructive/10 transition">
                    Удалить аккаунт
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal: New campaign */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-background/70 backdrop-blur-sm animate-fade-in-up"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-border bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="h-9 w-9 rounded-xl bg-primary/15 grid place-items-center">
                <Icon name="Rocket" size={18} className="text-primary" />
              </div>
              <h2 className="font-bold text-lg">Новая кампания</h2>
              <button onClick={() => setModalOpen(false)} className="ml-auto h-8 w-8 grid place-items-center rounded-lg hover:bg-secondary transition">
                <Icon name="X" size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Название кампании</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Например, Вечерний стрим"
                  className="mt-1.5 w-full rounded-xl bg-secondary/60 border border-border px-3.5 py-2.5 text-sm outline-none focus:border-primary transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Платформа</label>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {(['YouTube', 'Twitch', 'Kick'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setForm({ ...form, platform: p })}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-semibold transition ${
                        form.platform === p ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:bg-secondary/60'
                      }`}
                    >
                      <Icon name={PLATFORM_META[p].icon} size={20} className={PLATFORM_META[p].color} />
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Зрителей</label>
                  <input
                    type="number"
                    value={form.viewers}
                    onChange={(e) => setForm({ ...form, viewers: Number(e.target.value) })}
                    className="mt-1.5 w-full rounded-xl bg-secondary/60 border border-border px-3.5 py-2.5 text-sm font-mono-num outline-none focus:border-primary transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Чат-ботов</label>
                  <input
                    type="number"
                    value={form.bots}
                    onChange={(e) => setForm({ ...form, bots: Number(e.target.value) })}
                    className="mt-1.5 w-full rounded-xl bg-secondary/60 border border-border px-3.5 py-2.5 text-sm font-mono-num outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Время запуска</label>
                  <input
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    placeholder="оставьте пустым = сейчас"
                    className="mt-1.5 w-full rounded-xl bg-secondary/60 border border-border px-3.5 py-2.5 text-sm outline-none focus:border-primary transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Длительность</label>
                  <input
                    value={form.dur}
                    onChange={(e) => setForm({ ...form, dur: e.target.value })}
                    className="mt-1.5 w-full rounded-xl bg-secondary/60 border border-border px-3.5 py-2.5 text-sm outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Icon name="Info" size={13} />
                Без времени запуска кампания стартует сразу, иначе попадёт в расписание.
              </p>

              <div className="flex gap-2.5 pt-1">
                <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-secondary/60 transition">
                  Отмена
                </button>
                <button
                  onClick={submitCampaign}
                  disabled={!form.name.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <Icon name="Rocket" size={16} /> Запустить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;