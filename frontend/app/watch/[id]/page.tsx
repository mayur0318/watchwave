import WatchView from "@/components/WatchView";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <WatchView key={id} id={id} />;
}
