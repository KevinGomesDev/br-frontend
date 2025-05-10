type InfoCardProps = {
  selectedTile: { x: number; y: number; type: string } | null;
  onClear: () => void;
};
export default function InfoCard({ selectedTile, onClear }: InfoCardProps) {
  return (
    <div className="bg-white p-4 rounded shadow-md w-full">
      <h2 className="text-lg font-bold mb-2">Informações do Terreno</h2>
      {selectedTile ? (
        <>
          <p>
            Coordenadas: {selectedTile.x} / {selectedTile.y}
          </p>
          <p>
            Tipo: <span className="capitalize">{selectedTile.type}</span>
          </p>
          <button
            onClick={onClear}
            className="mt-4 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          >
            Limpar Seleção
          </button>
        </>
      ) : (
        <p className="italic text-gray-500">Nenhum tile selecionado.</p>
      )}
    </div>
  );
}
