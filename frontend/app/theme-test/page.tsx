import { getAutoTheme, resolveTheme } from "@/lib/theme";

const cases = [
  { label: "00:00:00 IST", utc: "2026-11-20T18:30:00Z", expected: "dark" },
  { label: "04:59:59 IST", utc: "2026-11-20T23:29:59Z", expected: "dark" },
  { label: "05:00:00 IST", utc: "2026-11-20T23:30:00Z", expected: "light" },
  { label: "08:30:00 IST", utc: "2026-11-21T03:00:00Z", expected: "light" },
  { label: "11:59:59 IST", utc: "2026-11-21T06:29:59Z", expected: "light" },
  { label: "12:00:00 IST", utc: "2026-11-21T06:30:00Z", expected: "dark" },
];

export default function ThemeTestPage() {
  const results = cases.map((c) => {
    const actual = getAutoTheme(new Date(c.utc));
    return { ...c, actual, pass: actual === c.expected };
  });

  const manual = [
    {
      label: "dark chosen at 08:30 IST",
      actual: resolveTheme("dark", new Date("2026-11-21T03:00:00Z")),
      expected: "dark",
    },
    {
      label: "light chosen at 00:00 IST",
      actual: resolveTheme("light", new Date("2026-11-20T18:30:00Z")),
      expected: "light",
    },
    {
      label: "auto at 08:30 IST",
      actual: resolveTheme("auto", new Date("2026-11-21T03:00:00Z")),
      expected: "light",
    },
  ].map((c) => ({ ...c, pass: c.actual === c.expected }));

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-xl font-bold">Theme rule test</h1>
      <ul className="flex flex-col gap-2">
        {[...results, ...manual].map((r) => (
          <li key={r.label}>
            {r.pass ? "PASS" : "FAIL"} · {r.label} → {r.actual} (expected{" "}
            {r.expected})
          </li>
        ))}
      </ul>
    </main>
  );
}
