
import { Calendar } from "../ui/calendar";
import { useState } from "react";

export function WorkSchedule() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Horario Laboral</h2>
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      />
    </div>
  );
}
