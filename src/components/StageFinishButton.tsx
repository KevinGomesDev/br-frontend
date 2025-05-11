export function StageFinishButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
    >
      Finalizar Etapa
    </button>
  );
}
