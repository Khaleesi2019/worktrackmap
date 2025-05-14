
```tsx
import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

const projects = [
  "Lomita Project",
  "Sunset Project",
  "512 Paulina Ave.",
  // Otros proyectos...
  "Other"
];

export default function ProjectsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl mb-6">Seleccione un Proyecto</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <Card key={index} className="transition-transform hover:scale-105 transform bg-white shadow-lg">
            <CardHeader>
              <CardTitle>{project}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
```
