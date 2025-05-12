type BattleHeaderProps = {
  terrainType: string;
  terrainCoords: { x: number; y: number };
  onClose: () => void;
};

export default function BattleHeader({
  terrainType,
  terrainCoords,
}: BattleHeaderProps) {
  return (
    <div className="mb-4">
      <h2>
        Batalha em terreno: {terrainType} ({terrainCoords.x}, {terrainCoords.y})
      </h2>
    </div>
  );
}
