'use client';

const tripDays = [
  {
    day: 1,
    date: "15 марта 2026",
    places: [
      { id: 1, title: "Кафе Лаванда", time: "10:00", status: "confirmed" },
      { id: 2, title: "Парк Горького", time: "12:30", status: "confirmed" },
      { id: 3, title: "Третьяковская галерея", time: "15:00", status: "planned" },
    ]
  },
  {
    day: 2,
    date: "16 марта 2026",
    places: [
      { id: 4, title: "Ресторан Огонь", time: "11:00", status: "planned" },
      { id: 5, title: "Зарядье", time: "14:00", status: "planned" },
      { id: 6, title: "Кофейня Бариста", time: "18:00", status: "planned" },
    ]
  },
  {
    day: 3,
    date: "17 марта 2026",
    places: [
      { id: 7, title: "ВДНХ", time: "10:00", status: "planned" },
    ]
  }
];

export default function TripPlan() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800 p-6 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl">Выходные в Москве</h1>
          <p className="text-gray-400 text-sm">15–17 марта 2026 • Москва</p>
        </div>
        <button className="px-6 py-3 border border-white rounded-2xl hover:bg-white hover:text-black transition">
          Чат
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-8">
        <h2 className="text-3xl font-bold mb-10">Финальный маршрут</h2>

        <div className="space-y-12">
          {tripDays.map((day) => (
            <div key={day.day}>
              {/* День */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-white text-black rounded-2xl flex items-center justify-center font-bold text-xl">
                  {day.day}
                </div>
                <div>
                  <div className="text-xl font-semibold">День {day.day}</div>
                  <div className="text-gray-400">{day.date}</div>
                </div>
              </div>

              {/* Места дня */}
              <div className="ml-6 border-l-2 border-gray-700 pl-8 space-y-4">
                {day.places.map((place) => (
                  <div
                    key={place.id}
                    className="flex items-start gap-6 bg-zinc-900 border border-gray-700 rounded-3xl p-6 hover:border-gray-400 transition"
                  >
                    <div className="text-sm font-medium w-16 text-gray-400">{place.time}</div>
                    <div className="flex-1">
                      <div className="text-xl font-medium">{place.title}</div>
                      <div className="text-sm text-gray-400 mt-1">
                        {place.status === "confirmed" ? "✅ Подтверждено" : "⏳ Запланировано"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}