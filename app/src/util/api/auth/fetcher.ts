import type { Liff } from "@line/liff";

import type { UserData } from "@/util/api/auth/types";

/**
 * CSRFトークンを取得する
 * @returns XSRF-TOKENを含むクッキーを取得し、それを返す
 */
export const getCsrfToken = async (): Promise<string> => {
	try {
		// SanctumのCSRFトークンを取得
		await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/sanctum/csrf-cookie`, {
			credentials: "include",
			method: "GET",
		});

		// クッキーからXSRF-TOKENを取得
		const xsrfToken = decodeURIComponent(
			document.cookie
				.split("; ")
				.find((row) => row.startsWith("XSRF-TOKEN="))
				?.split("=")[1] || "",
		);

		if (!xsrfToken) {
			throw new Error("XSRF-TOKENが見つかりませんでした");
		}

		return xsrfToken;
	} catch (error) {
		console.error("csrfトークンの取得に失敗しました", error);
		throw error;
	}
};

/**
 * LIFFのローカルストレージに保存されているキーを取得する
 * @param prefix
 * @returns
 */
const getLiffLocalStorageKeys = (prefix: string) => {
	const keys = [];
	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i);
		if (key?.indexOf(prefix) === 0) {
			keys.push(key);
		}
	}
	return keys;
};

/**
 * 期限切れのidTokenを削除する
 * @param liffId
 * @returns
 */
const clearExpiredIdToken = (liffId: string) => {
	const keyPrefix = `LIFF_STORE:${liffId}:`;
	const key = `${keyPrefix}decodedIDToken`;
	const decodedIDTokenString = localStorage.getItem(key);
	if (!decodedIDTokenString) {
		return;
	}
	const decodedIDToken = JSON.parse(decodedIDTokenString);
	// 有効期限をチェック
	if (new Date().getTime() > decodedIDToken.exp * 1000) {
		const keys = getLiffLocalStorageKeys(keyPrefix);
		for (const key of keys) {
			localStorage.removeItem(key);
		}
	}
};

/**
 * アクセストークンをわたすことでユーザーデータを取得する
 * @param idToken アクセストークン
 * @param liff LIFF
 * @param liffId LIFF ID
 * @param retries 残りの再試行回数
 * @returns ユーザーデータのPromise
 */
export const loginWithToken = async (
	idToken: string,
	liff: Liff,
	liffId: string,
	retries = 2,
): Promise<UserData> => {
	try {
		const xsrfToken = await getCsrfToken();

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_AUTH_URL}/api/v1/login`,
			{
				body: JSON.stringify({ idToken }),
				credentials: "include", // idTokenをリクエストボディに含める
				headers: {
					"Content-Type": "application/json",
					"X-Requested-With": "XMLHttpRequest",
					"X-XSRF-TOKEN": xsrfToken,
				},
				method: "POST", // クッキーを送信
			},
		);

		// ステータスコードのチェック
		if (response.status === 460) {
			// idTokenが期限切れの場合、新しいidTokenを取得して再試行
			if (retries > 0) {
				clearExpiredIdToken(liffId);
				await liff.init({ liffId });
				const newIdToken = liff.getIDToken() || "";
				document.cookie = `idToken=${newIdToken}`;
				return loginWithToken(newIdToken, liff, liffId, retries - 1);
			}
			console.error(
				"idTokenの再取得に失敗しました。再試行回数が上限に達しました。",
			);
			throw new Error(
				"idTokenの再取得に失敗しました。再試行回数が上限に達しました。",
			);
		}

		if (!response.ok) {
			const errorData = await response.json(); // エラーメッセージを取得
			console.error("エラーレスポンス:", errorData);
			throw new Error(
				`HTTPエラー: ${response.status} - ${JSON.stringify(errorData)}`,
			);
		}

		const data: UserData = await response.json();
		return data;
	} catch (error) {
		console.error("ログインに失敗しました", error);
		throw error;
	}
};
