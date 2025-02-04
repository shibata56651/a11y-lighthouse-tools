import Link from "next/link";

import styles from "./styles.module.scss";

export default function Page() {
	return (
		<>
			<div className={`${styles.home}`}>
				<h2 className={`${styles["home__text--lg"]}`}>HOME</h2>
				<h2 className={`${styles["home__text--sm"]}`}>ログイン済み</h2>
			</div>
			<h3>
				<Link href="/ssr_sample">SSR Sample</Link>
			</h3>
			<h3>
				<Link href="/formactions_sample">FormActions Sample</Link>
			</h3>
		</>
	);
}
