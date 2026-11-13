export default function ComingSoon({ title, phase }) {
  return (
    <>
      <h1>{title}</h1>
      <div className="card"><p className="muted">This module is built in Phase {phase}.</p></div>
    </>
  );
}
