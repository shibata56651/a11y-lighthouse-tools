import { cookies } from "next/headers";

/**
 * クッキーからIDトークンを取得する
 * @returns idToken IDトークン
 */
export const getIdTokenFromCookies = async (): Promise<string | null> => {
	const cookieStore = await cookies();
	const idToken = cookieStore.get("idToken")?.value;
	if (!idToken) {
		throw new Error("ID token not found in cookies");
	}

	return idToken;
};
