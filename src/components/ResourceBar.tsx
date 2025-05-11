import { useResources } from "../contexts/ResourceContext";

export default function ResourceBar() {
  const { resources, production } = useResources();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-6 text-sm">
      {Object.entries(resources).map(([key, value]) => (
        <div
          key={key}
          className="flex items-center gap-2 bg-white shadow rounded p-2"
        >
          <img
            src={`/icons/${key}.jpg`}
            alt={key}
            className="w-6 h-6 object-contain"
          />
          <div>
            <p className="capitalize font-semibold text-gray-700">{key}</p>
            <p className="text-gray-900">{value}</p>
            <p className="text-xs text-green-600">
              +{production[key as keyof typeof production]}/turno
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
