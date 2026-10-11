'use client';
import { useEffect, useRef, useState } from 'react';
import { Search, X, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { api } from '@/lib/api';
import { useParticleStore } from '@/lib/particleStore';
import type { Record, PaginatedResponse } from '@/lib/types';
import DatasetNote from '@/components/DatasetNote';

type Filters = { q: string; age: string; sort: 'source' | 'name' | 'age'; ascending: boolean; page: number };
const defaults: Filters = { q: '', age: '', sort: 'source', ascending: true, page: 1 };
const number = (n: number) => n.toLocaleString('ar-u-nu-arab');
function readFilters(): Filters {
  const p = new URLSearchParams(window.location.search);
  const sort = p.get('sort');
  return { q: (p.get('q') || '').slice(0, 200), age: p.get('age') || '',
    sort: sort === 'name' || sort === 'age' ? sort : 'source', ascending: p.get('ascending') !== 'false',
    page: Math.max(1, Math.floor(Number(p.get('page')) || 1)) };
}

export default function LivingArchiveScene() {
  const [filters, setFilters] = useState<Filters>(defaults);
  const [hydrated, setHydrated] = useState(false);
  const [composing, setComposing] = useState(false);
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<PaginatedResponse<Record> | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const input = useRef<HTMLInputElement>(null);
  const navigation = useRef(false);
  const total = useParticleStore(s => s.total);
  const invalidAge = filters.age !== '' && (!Number.isInteger(Number(filters.age)) || Number(filters.age) < 0 || Number(filters.age) > 150);
  useEffect(() => {
    const restore = () => { navigation.current = false; setFilters(readFilters()); setHydrated(true); };
    restore();
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, []);
  useEffect(() => {
    if (!hydrated || composing || invalidAge) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setStatus('loading');
      const params = new URLSearchParams({ page: String(filters.page), page_size: '12', sort: filters.sort, ascending: String(filters.ascending) });
      if (filters.q.trim()) params.set('q', filters.q.trim());
      if (filters.age !== '') params.set('age', filters.age);
      const url = new URL(window.location.href);
      for (const key of ['q', 'age', 'sort', 'ascending', 'page']) {
        const value = params.get(key);
        if (value && value !== String(defaults[key as keyof Filters])) url.searchParams.set(key, value);
        else url.searchParams.delete(key);
      }
      if (url.href !== window.location.href) {
        if (navigation.current) window.history.pushState(null, '', url);
        else window.history.replaceState(null, '', url);
      }
      navigation.current = false;
      try {
        const data = await api.browseRecords(params, controller.signal);
        if (controller.signal.aborted) return;
        setResult(data);
        setStatus('ready');
        if (data.page !== filters.page) setFilters(f => ({ ...f, page: data.page }));
        useParticleStore.setState({ archiveRecords: data.items });
      } catch {
        if (!controller.signal.aborted) { setStatus('error'); setResult(null); }
      }
    }, filters.q ? 300 : 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [filters, retry, hydrated, composing, invalidAge]);
  const change = (next: Partial<Filters>) => { navigation.current = 'sort' in next || 'page' in next; setFilters(f => ({ ...f, ...next, page: next.page ?? 1 })); setStatus('loading'); };
  const clear = () => { change({ q: '', age: '' }); input.current?.focus(); };
  return <section id="archive" className="chapter archive" aria-labelledby="archive-title">
    <div className="archive-intro"><div><h2 id="archive-title">يبقى <em>الاسم.</em></h2><p className="archive-lead">ابحث، اقرأ، واستحضر إنسانًا وراء كلّ سجل.</p></div>
      <p className="archive-total"><strong>{total === null ? '—' : number(total)}</strong><span>اسمًا في الأرشيف</span></p></div>
    <div className="archive-workspace">
      <form noValidate className="archive-filters" onSubmit={e => { e.preventDefault(); setRetry(r => r + 1); }}>
        <div className="archive-search-field"><label htmlFor="archive-query">الاسم أو اسم العائلة</label><div className="archive-input-wrap"><Search size={20} aria-hidden="true"/><input ref={input} id="archive-query" type="search" maxLength={200} placeholder="بالعربية أو بالإنجليزية" value={filters.q} onCompositionStart={() => setComposing(true)} onCompositionEnd={() => setComposing(false)} onChange={e => change({ q: e.target.value })}/>{filters.q && <button type="button" aria-label="مسح البحث" onClick={() => { change({ q: '' }); input.current?.focus(); }}><X size={18}/></button>}</div></div>
        <div><label htmlFor="archive-age">العمر المسجّل</label><input id="archive-age" type="number" min={0} max={150} placeholder="كل الأعمار" value={filters.age} aria-invalid={invalidAge} aria-describedby={invalidAge ? 'age-error' : undefined} onChange={e => change({ age: e.target.value })}/></div>
        <div><label htmlFor="archive-sort">ترتيب الأسماء</label><select id="archive-sort" value={`${filters.sort}:${filters.ascending}`} onChange={e => { const [sort, direction] = e.target.value.split(':'); change({ sort: sort as Filters['sort'], ascending: direction === 'true' }); }}>
          <option value="source:true">كما وردت في المصدر</option><option value="name:true">الاسم · أ إلى ي</option><option value="name:false">الاسم · ي إلى أ</option><option value="age:true">العمر · الأصغر أولًا</option><option value="age:false">العمر · الأكبر أولًا</option></select></div>
        {invalidAge && <p id="age-error" className="field-error">أدخل عمرًا صحيحًا من ٠ إلى ١٥٠.</p>}
      </form>
      <div className="archive-results" aria-busy={status === 'loading' && !invalidAge}>
        <p className="archive-results-status" role="status">{invalidAge ? 'صحّح العمر لعرض النتائج.' : status === 'loading' ? 'جارٍ تحميل الأسماء…' : status === 'error' ? 'تعذّر تحميل الأسماء.' : `${number(result?.total || 0)} اسمًا${filters.q || filters.age ? ' يطابق البحث' : ''}`}</p>
        {!invalidAge && status === 'error' ? <div className="archive-feedback"><p>لم نتمكن من الوصول إلى الأرشيف. احتفظنا ببحثك لتتمكن من المحاولة مجددًا.</p><button className="text-link" type="button" onClick={() => setRetry(r => r + 1)}><RotateCcw size={18}/>إعادة تحميل الأسماء</button></div>
          : !invalidAge && status === 'ready' && !result?.items.length ? <div className="archive-feedback"><h3>لا توجد أسماء مطابقة</h3><p>جرّب جزءًا من الاسم، أو أزل العمر لتوسيع البحث.</p><button className="text-link" type="button" onClick={clear}>مسح المرشّحات</button></div>
          : <div className="record-grid">{!invalidAge && result?.items.map(r => <button type="button" className="archive-record" key={r.id} aria-label={`عرض سجل ${r.ar_name || r.en_name}`} disabled={status === 'loading'} onClick={() => useParticleStore.setState({ selectedRecord: r })}>
            <span className="record-card-meta"><span>{r.age === null ? 'العمر غير مسجّل' : r.age === 0 ? 'دون عام واحد' : `${number(r.age)} عامًا`}</span><bdi>{r.id.startsWith('derived-') ? 'بلا رقم مصدر' : r.id}</bdi></span>
            <span className="record-card-name" dir={r.ar_name ? 'rtl' : 'ltr'} lang={r.ar_name ? 'ar' : 'en'}>{r.ar_name || r.en_name}</span>
            {r.ar_name && r.en_name && <span className="record-card-english" lang="en" dir="ltr">{r.en_name}</span>}
            <span className="record-card-open">قراءة السجل <ArrowLeft size={16} aria-hidden="true"/></span>
          </button>)}</div>}
      </div>
      {status === 'ready' && !invalidAge && result && result.total_pages > 1 && <nav className="archive-pagination" aria-label="صفحات الأسماء">
        <button type="button" disabled={result.page <= 1} onClick={() => change({ page: result.page - 1 })}><ArrowRight size={18} aria-hidden="true"/>السابق</button><span>صفحة <bdi>{number(result.page)}</bdi> من <bdi>{number(result.total_pages)}</bdi></span><button type="button" disabled={result.page >= result.total_pages} onClick={() => change({ page: result.page + 1 })}>التالي<ArrowLeft size={18} aria-hidden="true"/></button>
      </nav>}
    </div>
    <DatasetNote/>
  </section>;
}
