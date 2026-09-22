import { EditorLoader } from "@/components/EditorLoader";

export const metadata = { title: "Editor" };

export default async function EditorPage({ params }: PageProps<"/editor/[resumeId]">) {
  const { resumeId } = await params;
  return <EditorLoader resumeId={resumeId} />;
}
