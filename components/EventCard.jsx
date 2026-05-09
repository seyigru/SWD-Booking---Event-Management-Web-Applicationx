// card for one event on the browse page — shows the main bits + how many spots left
export default function EventCard({ event, onBook }) {
  const cap = Number(event.capacity);
  const booked = Number(event.bookings_count ?? 0);
  const spotsLeft = cap - booked;

  // date comes from mysql as a string usually — this is good enough for display
  let dateLabel = event.date;
  try {
    const d = new Date(event.date);
    if (!Number.isNaN(d.getTime())) {
      dateLabel = d.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    }
  } catch {
    // leave as raw string if parsing fails
  }

  const priceNum = Number(event.price);
  const priceLabel =
    Number.isFinite(priceNum) && !Number.isNaN(priceNum)
      ? `$${priceNum.toFixed(2)}`
      : event.price;

  return (
    <article className="event-card">
      <h3 className="event-card__title">{event.title}</h3>
      <p className="event-card__meta">{dateLabel}</p>
      <p className="event-card__meta">{event.location}</p>
      <p className="event-card__price">{priceLabel}</p>
      <p className="event-card__spots">
        {spotsLeft <= 0 ? 'No spots left' : `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} remaining`}
      </p>
      <button type="button" className="btn btn--primary" onClick={() => onBook(event.id)}>
        Book
      </button>
    </article>
  );
}
