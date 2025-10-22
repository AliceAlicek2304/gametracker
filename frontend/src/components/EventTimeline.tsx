import React, { useEffect, useRef, useState } from 'react';
import styles from './EventTimeline.module.css';
import { apiFetch } from '../utils/apiHelper';
import { bannerService } from '../services/bannerService';
import EventDetailModal from './EventDetailModal';
import { useNavigate } from 'react-router-dom';

type EventItem = {
  id: number;
  title: string;
  description?: string;
  startAt?: string;
  endAt?: string | null;
  imageUrl?: string;
  isActive?: boolean;
};

const dayMs = 24 * 60 * 60 * 1000;

const EventTimeline: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [days, setDays] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<number>(Date.now());
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const datesRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const [showEvent, setShowEvent] = useState<any | null>(null);
  const [nowTs, setNowTs] = useState<number>(Date.now());
  // hoveringNow removed — corner time label used instead
  const syncScrolling = useRef(false);

  useEffect(() => {
    // fetch active events for public timeline
    apiFetch('events/active')
      .then(res => res.json())
      .then((data: EventItem[]) => {
        setEvents(data || []);
      })
      .catch(err => console.error('Failed to fetch events for timeline', err));

    // fetch current banners and map to timeline items
    bannerService.getCurrentBanners()
      .then((data: any[]) => {
        const mapped = (data || []).map(b => ({
          id: `banner-${b.id}`,
          title: b.name,
          startAt: b.startDate,
          endAt: b.endDate,
          imageUrl: b.bannerType === 'CHARACTER' ? b.featured5StarCharacterImageUrl : b.featured5StarWeaponImageUrl,
          isBanner: true,
        }));
        setBanners(mapped);
      })
      .catch(err => {
        console.error('Failed to fetch banners for timeline', err);
        setBanners([]);
      });
  }, []);

  useEffect(() => {
    if (!events || events.length === 0) return;
    const parsed = events.map(e => ({
      ...e,
      s: e.startAt ? new Date(e.startAt).getTime() : null,
      eAt: e.endAt ? new Date(e.endAt as string).getTime() : null,
    }));

    let min = Infinity;
    let max = -Infinity;
    parsed.forEach(p => {
      if (p.s && p.s < min) min = p.s;
      if (p.eAt && p.eAt < min) min = p.eAt;
      if (p.eAt && p.eAt > max) max = p.eAt;
      if (p.s && p.s > max) max = p.s;
    });

    if (min === Infinity) min = Date.now();
    if (max === -Infinity) max = min + dayMs * 7;

    // pad one week on both sides
    const pad = dayMs * 7;
    min = min - pad;
    max = max + pad;

    // generate day labels
    const daysArr: string[] = [];
    const startDay = Math.floor(min / dayMs) * dayMs;
    const endDay = Math.ceil(max / dayMs) * dayMs;
    for (let t = startDay; t <= endDay; t += dayMs) {
      const dt = new Date(t);
      daysArr.push(dt.toISOString().slice(0, 10));
    }

    setStartDate(startDay);
    setDays(daysArr);
  }, [events]);

  // Wheel handler: vertical wheel scroll -> horizontal scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (ev: WheelEvent) => {
      if (Math.abs(ev.deltaY) > Math.abs(ev.deltaX)) {
        ev.preventDefault();
        el.scrollLeft += ev.deltaY;
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel as any);
  }, [scrollRef.current]);

  // sync horizontal scroll between dates header and grid
  useEffect(() => {
    const datesEl = datesRef.current;
    const gridEl = scrollRef.current;
    if (!datesEl || !gridEl) return;

    const onDatesScroll = () => {
      if (syncScrolling.current) return;
      syncScrolling.current = true;
      gridEl.scrollLeft = datesEl.scrollLeft;
      // release after frame
      requestAnimationFrame(() => { syncScrolling.current = false; });
    };

    const onGridScroll = () => {
      if (syncScrolling.current) return;
      syncScrolling.current = true;
      datesEl.scrollLeft = gridEl.scrollLeft;
      requestAnimationFrame(() => { syncScrolling.current = false; });
    };

    datesEl.addEventListener('scroll', onDatesScroll);
    gridEl.addEventListener('scroll', onGridScroll);
    return () => {
      datesEl.removeEventListener('scroll', onDatesScroll);
      gridEl.removeEventListener('scroll', onGridScroll);
    };
  }, [datesRef.current, scrollRef.current]);

  // live 'now' ticker
  useEffect(() => {
    const t = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const dayWidth = 48; // px per day
  const rowHeight = 56;

  // deterministic palette picker by id/title
  const palette = [
    ['#084e70', '#0b5168'], // deep cyan/blue
    ['#7f1d1d', '#6b1b1b'], // deep burgundy
    ['#7c2d12', '#5c2110'], // dark burnt orange
    ['#14532d', '#0f5132'], // deep forest green
    ['#4c1d95', '#3b1464'], // deep purple
    ['#92400e', '#713f12'], // dark amber
    ['#0e5f5a', '#0b4f4b'], // muted teal
  ];

  const pickGradient = (key: string | number) => {
    const str = String(key);
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h * 31 + str.charCodeAt(i)) >>> 0;
    }
    const idx = h % palette.length;
    const p = palette[idx];
    return `linear-gradient(90deg, ${p[0]} 0%, ${p[1]} 100%)`;
  };

  return (
  <div className={styles.timelineRoot}>
      <div className={styles.headerRow}>
        <div className={styles.datesRow} ref={datesRef}>
          <div className={styles.datesInner} style={{ width: days.length * dayWidth }}>
            {days.map((d, i) => {
              const dt = new Date(d + 'T00:00:00');
              const label = dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
              return (
                <div key={d} className={styles.dateCell} style={{ width: dayWidth }}>
                  {label}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles.bodyRow}>
        <div className={styles.gridWrap} ref={scrollRef}>
              <div className={styles.grid} style={{ width: days.length * dayWidth, minHeight: Math.max((events.length + banners.length) * rowHeight, 200) }}>
            {/* vertical grid lines */}
            {days.map((d, i) => (
              <div key={d} className={styles.gridCell} style={{ left: i * dayWidth, width: dayWidth }} />
            ))}

            {/* small 'now' label inside grid so it scrolls with timeline */}
            {typeof startDate === 'number' && (
              (() => {
                const rel = (nowTs - startDate) / dayMs; // days from start
                const leftPx = Math.round(rel * dayWidth);
                return (
                  <div
                    className={styles.nowInGridLabel}
                    style={{ left: leftPx }}
                  >
                    {new Date(nowTs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                );
              })()
            )}

            {/* banner rows first, then event rows */}
            {[...banners, ...events].map((ev, idx) => {
              const s = ev.startAt ? new Date(ev.startAt).getTime() : null;
              const e = ev.endAt ? new Date(ev.endAt as string).getTime() : null;
              const start = s ? Math.max(s, startDate) : startDate;
              const end = e ? Math.max(e, start + dayMs) : (start + dayMs);
              const left = Math.round((start - startDate) / dayMs) * dayWidth;
              const width = Math.max(Math.round((Math.max(end, start + dayMs) - start) / dayMs) * dayWidth, dayWidth);
              const daysLeft = ev.endAt ? Math.max(0, Math.ceil((new Date(ev.endAt).getTime() - Date.now()) / dayMs)) : null;
              const onClick = () => {
                if (ev.isBanner) {
                  navigate('/banners');
                } else {
                  setShowEvent(ev);
                }
              };

              return (
                <div
                  key={ev.id}
                  className={styles.eventBar}
                  style={{ top: idx * rowHeight, left, width, background: pickGradient(ev.id) }}
                  title={`${ev.title} (${ev.startAt || ''} → ${ev.endAt || ''})`}
                  onClick={onClick}
                >
                  <div className={styles.eventBarInner}>
                    <div className={styles.eventTitle}>{ev.title}</div>
                    {ev.isBanner && ev.imageUrl ? (
                      <div className={styles.bannerThumbWrap}>
                        <img src={ev.imageUrl} className={styles.bannerThumb} alt="banner" />
                        <div className={styles.bannerDays}>{daysLeft !== null ? `${daysLeft}d` : '0d'}</div>
                      </div>
                    ) : (
                      <>
                        {ev.imageUrl && <img src={ev.imageUrl} className={styles.eventThumb} alt="thumb" />}
                        {daysLeft !== null && <div className={styles.eventDays}>{`${daysLeft}d`}</div>}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            </div>
        </div>
      </div>
      {showEvent && (
        <EventDetailModal isOpen={!!showEvent} onClose={() => setShowEvent(null)} event={showEvent} />
      )}
    </div>
  );
};

export default EventTimeline;
