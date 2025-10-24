import { cva, type VariantProps } from 'class-variance-authority';

export const navLinkStyles = cva(
    // Base visual parity with .pill-nav a in CSS
    'tw-text-text tw-text-base tw-py-2 tw-px-3.5 tw-rounded-lg tw-font-medium tw-transition-colors hover:tw-bg-secondary hover:tw-text-primary',
    {
        variants: {
            active: {
                // Keep unprefixed "active" to leverage existing .pill-nav a.active styles for exact parity
                true: 'active',
                false: '',
            },
        },
        defaultVariants: {
            active: false,
        },
    }
);

export type NavLinkStyleProps = VariantProps<typeof navLinkStyles>;

// Layout and structure helpers for Navbar (pixel-parity with CSS)
export const brandLinkStyles = cva(
    'brand-link tw-inline-flex tw-items-center tw-gap-3 tw-text-text tw-no-underline tw-transition hover:tw-text-primary hover:-tw-translate-y-px'
);

export const brandLogoStyles = cva(
    'brand-logo tw-flex tw-items-center tw-justify-center'
);

export const desktopMenuStyles = cva(
    'desktop-menu tw-flex tw-items-center tw-justify-between tw-flex-1'
);

export const navbarMenuCenterStyles = cva(
    'navbar-menu-center tw-flex tw-justify-center tw-flex-grow tw-mx-5'
);

export const navbarLinksStyles = cva(
    'navbar-links tw-list-none tw-p-0 tw-mx-auto tw-flex tw-gap-[30px]'
);

export const navbarUserStyles = cva(
    'navbar-user tw-flex tw-items-center tw-gap-[15px]'
);

export const userAvatarStyles = cva(
    'user-avatar tw-w-8 tw-h-8 tw-rounded-full tw-border-[2px] tw-border-border tw-object-cover'
);

export const mobileMenuContentStyles = cva(
    'mobile-menu-content tw-flex tw-flex-col tw-justify-between tw-h-full tw-min-h-screen tw-pt-20 tw-px-5 tw-pb-5'
);

export const mobileMenuLinksStyles = cva(
    'mobile-menu-links tw-flex-1 tw-flex tw-flex-col'
);

