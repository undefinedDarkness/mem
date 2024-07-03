import { useRouter } from "next/navigation";

export function clearUrlParam(key: string) {
    const router = useRouter()
    const url = new URL(window.location.href)
    url.searchParams.delete(key)
    router.push(url.href)
}