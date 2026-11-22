import ChannelView from "@/components/ChannelView";

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ userName: string }>;
}) {
  const { userName } = await params;
  return <ChannelView key={userName} userName={userName} />;
}
