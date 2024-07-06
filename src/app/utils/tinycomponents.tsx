import Link from "next/link"
import { LinkProps, Link as RadixLink } from "@radix-ui/themes"
import { PropsWithChildren, ReactNode, FC, HTMLProps, RefAttributes } from "react"

type FullLinkProps = LinkProps & RefAttributes<HTMLAnchorElement>

export const FullLink: React.FC<PropsWithChildren<FullLinkProps>> = ({ href, ...props }) => {
    return <Link href={href ?? ''} legacyBehavior passHref>
        <RadixLink {...props} />
    </Link>
} 