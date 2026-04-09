import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import axios from "axios";

import "./styles/globals.css";
import { router } from "./routes";
import { useAuthStore } from "./store/authStore";

async function enableMocking(): Promise<void> {
	if (!import.meta.env.DEV) return;
	// Mock API는 로컬 개발 보조 수단이므로, 프로덕션 초기화 흐름은 MSW에 의존하지 않습니다.
	const { worker } = await import("./mocks/browser");
	await worker.start({ onUnhandledRequest: "bypass" });
}

async function recoverSession(): Promise<void> {
	// access token은 메모리에만 두기 때문에, 새로고침 복구는 refresh 쿠키 존재 여부부터 확인합니다.
	const hasCookie = document.cookie
		.split(";")
		.some((c) => c.trim().startsWith("token="));
	if (!hasCookie) return;
	try {
		const { data } = await axios.post<{ accessToken: string }>(
			"/api/refresh",
			{},
			{ withCredentials: true, baseURL: "/" },
		);
		useAuthStore.getState().setAccessToken(data.accessToken);
	} catch {
		// 유효한 세션이 없으면 이후 라우트 가드가 로그인 화면으로 안내합니다.
	}
}

// 첫 렌더 전에 세션을 복구해 두어야 새로고침 시 보호 라우트가 잠깐 로그인 화면으로 튀지 않습니다.
void enableMocking()
	.then(() => recoverSession())
	.then(() => {
		createRoot(document.getElementById("root")!).render(
			<StrictMode>
				<RouterProvider router={router} />
			</StrictMode>,
		);
	});
