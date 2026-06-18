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

const Index = () => {
  const [active, setActive] = useState('dashboard');
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [schedule, setSchedule] = useState<Scheduled[]>(INITIAL_SCHEDULE);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });

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