// red-ish error text for when fetch fails or API sends a message back
export default function ErrorMessage({ message }) {
  if (!message) return null;

  return <p className="error-msg">{message}</p>;
}
