"use server";

import { redirect } from "next/navigation";

import { getCsrfTokenForSaverSide } from "@/util/api/csrf/fetcher";
import type { DummyData } from "@/util/api/dummy/types";
import { getIdTokenFromCookies } from "@/util/api/getIdTokenFromCookies";

/**
 * ダミーデータをフェッチする
 * @param dummyId
 * @returns
 */
export const fetchDummyData = async (dummyId: number): Promise<DummyData> => {
	try {
		const idToken = await getIdTokenFromCookies();

		const dummyData = await fetch(`${process.env.API_URL}/dummy/${dummyId}`, {
			cache: "no-cache",
			headers: {
				"Content-Type": "application/json",
				Cookie: `idToken=${idToken}`,
				"X-SSR": "true",
			},
			method: "GET",
		});
		// レスポンスのステータスコードのチェック
		if (!dummyData.ok) {
			throw new Error(`HTTP error! status: ${dummyData.status}`);
		}

		// レスポンスをJSONとしてパース
		const data: DummyData = await dummyData.json();

		return data;
	} catch (error) {
		console.error("fetchDummyData error", error);
		throw error;
	}
};

/**
 * ダミーデータを投稿する (ServerActions)
 * @param formData
 */
export const postDummyData = async (formData: FormData): Promise<void> => {
	try {
		const xsrfToken = await getCsrfTokenForSaverSide();
		const idToken = await getIdTokenFromCookies();

		await fetch(`${process.env.API_URL}/dummy`, {
			credentials: "include", // idTokenをリクエストボディに含める
			headers: {
				"Content-Type": "application/json",
				Cookie: `idToken=${idToken}`,
				"X-Requested-With": "XMLHttpRequest",
				"X-SSR": "true",
				"X-XSRF-TOKEN": xsrfToken,
			},
			method: "POST",
		});

		redirect("thanks");
	} catch (error) {
		console.error("キャンペーン参加に失敗しました", error);
		throw error;
	}
};
