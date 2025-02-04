import { redirect } from "next/navigation";

export default async function Page(props: {
	searchParams: Promise<{ [key: string]: string }>;
}) {
	const searchParams = await props.searchParams;
	const pagePath = searchParams.page; // ?page={ページパス}で遷移先を指定できる
	if (pagePath) {
		redirect(`/${pagePath}`);
	} else {
		redirect("/home");
	}
}
