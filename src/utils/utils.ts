import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";

export function clearUrlParam(key: string | string[], router: AppRouterInstance) {
    // const router = useRouter()
    const url = new URL(window.location.href)
    if (Array.isArray(key)) 
        key.forEach(k => url.searchParams.delete(k)) 
    else 
        url.searchParams.delete(key)
    // window.location.href = url.href
    router.push(url.href)
}