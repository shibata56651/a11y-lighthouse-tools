"use client";

import React from "react";
import { useFormStatus } from "react-dom";

import { postDummyData } from "@/util/api/dummy/fetcher";

const Submit = () => {
	const status = useFormStatus();
	return (
		<button disabled={status.pending} type="submit">
			{status.pending ? "送信中" : "送信(登録はされません)"}
		</button>
	);
};

export default function Page() {
	return (
		<form action={postDummyData}>
			<label htmlFor="email">
				email
				<input defaultValue="dummy@example.com" name="email" type="email" />
			</label>
			<Submit />
		</form>
	);
}
