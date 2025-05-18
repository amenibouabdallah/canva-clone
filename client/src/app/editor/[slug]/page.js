"use client";

import MainEditor from "@/components/editor";
import { getUserDesigns } from "@/services/design-service";
import { useEditorStore } from "@/store";
import { useEffect } from "react";

export default function EditorPage() {
  const { setUserSubscription, setUserDesigns } = useEditorStore();



  async function fetchUserDesigns() {
    const result = await getUserDesigns();

    if (result?.success) setUserDesigns(result?.data);
  }

  useEffect(() => {
    fetchUserDesigns();
  }, []);
  return <MainEditor />;
}
