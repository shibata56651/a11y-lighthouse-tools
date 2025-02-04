"use server";

import { cookies } from "next/headers";

/**
 * CSRFトークンを取得する
 * @returns XSRF-TOKENを含むクッキーを取得し、それを返す
 */
export const getCsrfTokenForSaverSide = async (): Promise<string> => {
	try {
		// SanctumのCSRFトークンを取得
		await fetch(`${process.env.API_URL}/sanctum/csrf-cookie`, {
			credentials: "include",
			method: "GET",
		});

		const cookieStore = await cookies();

		// クッキーからXSRF-TOKENを取得
		const xsrfToken = cookieStore.get("XSRF-TOKEN")?.value;

		// XSRF-TOKENが見つからない場合はエラーをスロー
		if (!xsrfToken) {
			throw new Error("XSRF-TOKENがクッキーに見つかりません");
		}

		// トークンを返す
		return xsrfToken;
	} catch (error) {
		console.error("csrfトークンの取得に失敗しました", error);
		throw error;
	}
};
