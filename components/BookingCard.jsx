// one row on my bookings — This will show what event, and if they can still cancel
export default function BookingCard({ booking, onCancel }) {
  let dateLabel = booking.date;
  try {
    const d = new Date(booking.date);
    if (!Number.isNaN(d.getTime())) {
      dateLabel = d.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    }
  } catch {
    
  }

  const isConfirmed = booking.status === 'confirmed';

  return (
    <article className="booking-card">
      <h3 className="booking-card__title">{booking.title}</h3>
      <p className="booking-card__meta">{dateLabel}</p>
      <p className="booking-card__status">
        Status: <span className={`status-badge status-badge--${booking.status}`}>{booking.status}</span>
      </p>
      {isConfirmed ? (
        <button type="button" className="btn btn--secondary" onClick={() => onCancel(booking.id)}>
          Cancel
        </button>
      ) : null}
    </article>
  );
}
