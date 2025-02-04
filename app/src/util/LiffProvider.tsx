"use client";

import type { Liff } from "@line/liff";
import { useRouter } from "next/navigation";
import React, {
	type FC,
	createContext,
	type PropsWithChildren,
	useCallback,
	useEffect,
	useState,
	useContext,
	Suspense,
} from "react";

import Loading from "@/app/loading";
import { loginWithToken } from "@/util/api/auth/fetcher";
import type { UserData } from "@/util/api/auth/types";

/**
 * LIFFインスタンスとエラーメッセージを提供するためのコンテキスト
 */
const LiffContext = createContext<{
	liff: Liff | null;
	liffError: string | null;
}>({ liff: null, liffError: null });

/**
 * LIFFインスタンスとエラーメッセージを提供するためのカスタムフック
 */
export const useLiff = () => useContext(LiffContext);

/**
 * ユーザーデータを提供するためのコンテキスト
 */
const UserContext = createContext<{
	userId: string | null;
}>({ userId: null });

/**
 * ユーザーデータを提供するためのカスタムフック
 */
export const useUserData = () => useContext(UserContext);

const LiffProviderComponent: FC<PropsWithChildren> = ({ children }) => {
	const [liff, setLiff] = useState<Liff | null>(null);
	const [liffError, setLiffError] = useState<string | null>(null);
	const [isLiffInitialized, setIsLiffInitialized] = useState(false); // LIFFの初期化ステータス
	const liffId = process.env.NEXT_PUBLIC_LIFF_ID || "";
	const [userId, setUserId] = useState<string | null>(null);
	const router = useRouter();

	/**
	 * LIFFの初期化処理
	 */
	const initLiff = useCallback(async () => {
		if (!liffId) return;

		try {
			const liffModule = await import("@line/liff");
			const liff = liffModule.default;
			console.log("LIFF init...");

			await liff.init({ liffId });

			console.log("LIFF init succeeded.");
			setLiff(liff);
		} catch (error) {
			console.log("LIFF init failed.");
			setLiffError((error as Error).toString());
		} finally {
			setIsLiffInitialized(true); // 初期化完了
		}
	}, [liffId]);

	/**
	 * 初期化処理の呼び出し
	 */
	useEffect(() => {
		console.log("LIFF init start...");
		initLiff();
	}, [initLiff]);

	/**
	 * LIFFログイン&自社ログイン処理
	 */
	useEffect(() => {
		// 非同期処理を即時関数で実行
		(async () => {
			if (liff?.isLoggedIn()) {
				const idToken = liff.getIDToken();

				if (idToken) {
					try {
						const userData: UserData = await loginWithToken(
							idToken,
							liff,
							liffId,
						);
						// アクセストークンをCookieに保存
						document.cookie = `idToken=${idToken}`;
						setUserId(userData.id);
					} catch (error) {
						console.error("Error fetching user data:", error);
					}
				}
			} else {
				if (liff) {
					liff.login();
				}
			}
		})();
	}, [liff, liffId]);

	if (liffError) {
		router.push("/error");
	}

	// LIFFの初期化中またはログイン確認中はローディングUIを表示
	if (!isLiffInitialized || !liff?.isLoggedIn()) {
		return <Loading />;
	}

	return (
		<LiffContext.Provider
			value={{
				liff,
				liffError,
			}}
		>
			<UserContext.Provider
				value={{
					userId,
				}}
			>
				{children}
			</UserContext.Provider>
		</LiffContext.Provider>
	);
};

export const LiffProvider: FC<PropsWithChildren> = ({ children }) => {
	return (
		<Suspense fallback={<Loading />}>
			<LiffProviderComponent>{children}</LiffProviderComponent>
		</Suspense>
	);
};
