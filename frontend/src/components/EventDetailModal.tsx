import React, { useEffect, useState } from 'react';
import styles from './EventDetailModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  event: any | null;
}

const formatDateTime = (s?: string) => {
  if (!s) return '';
  const d = new Date(s);
  return d.toLocaleString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const EventDetailModal: React.FC<Props> = ({ isOpen, onClose, event }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!isOpen) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [isOpen]);

  if (!isOpen || !event) return null;

  const daysLeft = event.endAt ? Math.max(0, Math.floor((new Date(event.endAt).getTime() - now) / (1000*60*60*24))) : null;
  const hoursLeft = event.endAt ? Math.floor(((new Date(event.endAt).getTime() - now) % (1000*60*60*24)) / (1000*60*60)) : null;
  const minsLeft = event.endAt ? Math.floor(((new Date(event.endAt).getTime() - now) % (1000*60*60)) / (1000*60)) : null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
        {event.imageUrl && (
          <div className={styles.heroImage}>
            <img src={event.imageUrl} alt={event.title} />
          </div>
        )}
        <h2 className={styles.title}>{event.title}</h2>
        <div className={styles.dates}>{formatDateTime(event.startAt)} - {formatDateTime(event.endAt)}</div>
        <div className={styles.body}>{event.description}</div>

        <div className={styles.footerRow}>
          {event.link && (
            <a className={styles.detailLink} href={event.link} target="_blank" rel="noopener noreferrer">Bấm vào đây để xem chi tiết</a>
          )}
          <div className={styles.countdown}>
            Kết thúc sau: {daysLeft !== null ? `${daysLeft}d ${hoursLeft}h ${minsLeft}m` : '—'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;
