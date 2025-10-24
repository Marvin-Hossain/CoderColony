import { cva, type VariantProps } from 'class-variance-authority';

export const menuToggleStyles = cva(
    'menu-toggle',
    {
        variants: {
            open: {
                true: 'open',
                false: '',
            },
        },
        defaultVariants: {
            open: false,
        },
    }
);

export type MenuToggleStyleProps = VariantProps<typeof menuToggleStyles>;

export const mobileMenuOverlayStyles = cva(
    'mobile-menu-overlay',
    {
        variants: {
            active: {
                true: 'active',
                false: '',
            },
        },
        defaultVariants: {
            active: false,
        },
    }
);

export type MobileMenuOverlayStyleProps = VariantProps<typeof mobileMenuOverlayStyles>;

export const mobileMenuStyles = cva(
    'mobile-menu',
    {
        variants: {
            open: {
                true: 'open',
                false: '',
            },
        },
        defaultVariants: {
            open: false,
        },
    }
);

export type MobileMenuStyleProps = VariantProps<typeof mobileMenuStyles>;

// Structure and layout helpers (pixel-parity with existing CSS)
export const toolbarStyles = cva(
    'toolbar tw-w-full tw-fixed tw-top-0 tw-left-0 tw-z-[1000] tw-bg-primary tw-text-white tw-shadow-[0_2px_5px_rgba(77,107,254,0.15)]'
);

export const toolbarContentStyles = cva(
    'toolbar-content tw-max-w-[1200px] tw-mx-auto tw-px-[20px] tw-h-[60px] tw-flex tw-items-center tw-justify-between'
);

export const brandLinkStyles = cva(
    'brand-link tw-flex tw-items-center tw-gap-[10px] tw-text-white tw-no-underline tw-transition hover:tw-text-white/80 hover:-tw-translate-y-px'
);

export const brandLogoStyles = cva(
    'brand-logo tw-flex tw-items-center tw-justify-center tw-w-[32px] tw-h-[32px] tw-flex-shrink-0'
);

export const brandTextStyles = cva(
    'brand-text tw-text-[24px] tw-font-bold tw-whitespace-nowrap'
);

export const desktopMenuStyles = cva(
    'desktop-menu tw-flex tw-items-center tw-justify-between tw-flex-1'
);

export const toolbarMenuCenterStyles = cva(
    'toolbar-menu-center tw-flex tw-justify-center tw-flex-grow tw-mx-[20px]'
);

export const toolbarLinksStyles = cva(
    'toolbar-links tw-list-none tw-p-0 tw-mx-auto tw-flex tw-gap-[30px]'
);

export const toolbarLinkAnchorStyles = cva(
    'tw-text-white tw-no-underline tw-text-[16px] tw-py-[8px] tw-px-[16px] tw-rounded-[4px] tw-transition hover:tw-bg-[#3b54d0] hover:tw-text-white'
);

export const toolbarUserStyles = cva(
    'toolbar-user tw-flex tw-items-center tw-gap-[15px]'
);

export const userAvatarStyles = cva(
    'user-avatar tw-w-[32px] tw-h-[32px] tw-rounded-full tw-border-[2px] tw-border-white tw-object-cover'
);

export const mobileMenuContentStyles = cva(
    'mobile-menu-content tw-flex tw-flex-col tw-justify-between tw-h-full tw-min-h-screen tw-pt-[80px] tw-px-[20px] tw-pb-[20px]'
);

export const mobileMenuLinksStyles = cva(
    'mobile-menu-links tw-flex-1 tw-flex tw-flex-col'
);

