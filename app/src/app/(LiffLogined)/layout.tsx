import type React from "react";

import { LiffProvider } from "@/util/LiffProvider";

export default function Layout({ children }: { children: React.ReactNode }) {
	return <LiffProvider>{children}</LiffProvider>;
}
