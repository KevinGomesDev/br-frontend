import { useResources } from "../contexts/ResourceContext";

export default function ResourceBar() {
  const { resources, production } = useResources();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-6 text-sm">
      {Object.entries(resources).map(([key, value]) => (
        <div
          key={key}
          className="flex items-center gap-2 bg-card text-text shadow rounded p-2"
        >
          <img
            src={`/icons/${key}.jpg`}
            alt={key}
            className="w-6 h-6 object-contain"
          />
          <div>
            <p className="capitalize font-semibold text-text">{key}</p>
            <p className="text-text">{value}</p>
            <p className="text-xs text-[var(--resource-positive)]">
              +{production[key as keyof typeof production]}/turno
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
