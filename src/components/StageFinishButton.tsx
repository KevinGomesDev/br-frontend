export function StageFinishButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-[var(--button-primary)] text-[var(--button-primary-text)] px-3 py-1 rounded hover:bg-[var(--button-primary-hover)]"
    >
      Finalizar Etapa
    </button>
  );
}
