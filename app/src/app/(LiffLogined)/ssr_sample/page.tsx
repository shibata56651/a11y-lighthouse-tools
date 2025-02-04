import React from "react";

import type { DisplayData } from "@/app/(LiffLogined)/ssr_sample/types";
import { fetchDummyData } from "@/util/api/dummy/fetcher";
import type { DummyData } from "@/util/api/dummy/types";

export const dynamic = "force-dynamic"; // fetcherでcookie関数を使用するために必要

const Page = async () => {
	const dummyData: DummyData = await fetchDummyData(1);
	const displayData: DisplayData = {
		...dummyData,
		customParam: `${dummyData.id}-${dummyData.name}`,
	};

	return (
		<>
			<pre>{JSON.stringify(displayData, null, 2)}</pre>
		</>
	);
};

export default Page;
