
import { Card } from "../ui/card";
import { useState, useEffect } from "react";

export function StatsPanel() {
  const [stats, setStats] = useState({
    activeUsers: 0,
    totalSessions: 0,
    avgSessionTime: 0
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-4">
        <h3 className="font-bold">Usuarios Activos</h3>
        <p className="text-2xl">{stats.activeUsers}</p>
      </Card>
      <Card className="p-4">
        <h3 className="font-bold">Sesiones Totales</h3>
        <p className="text-2xl">{stats.totalSessions}</p>
      </Card>
      <Card className="p-4">
        <h3 className="font-bold">Tiempo Promedio</h3>
        <p className="text-2xl">{stats.avgSessionTime}min</p>
      </Card>
    </div>
  );
}
