const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

// shift = 1 → teal jadi satu tingkat lebih gelap dari emerald (gradient tetap ada kedalaman)
const brand = (shift = 0) =>
    Object.fromEntries(
        steps.map((step, i) => [
            step,
            `rgb(var(--brand-${steps[Math.min(i + shift, steps.length - 1)]}) / <alpha-value>)`,
        ]),
    );

/** @type {import('tailwindcss').Config} */

export default {
    darkMode: "class",

    content: [
        "./resources/**/*.blade.php",
        "./resources/**/*.js",
        "./resources/**/*.jsx",
        "./resources/**/*.ts",
        "./resources/**/*.tsx",
        "./resources/**/*.vue",
    ],

    theme: {
        extend: {
            colors: {
                border: "var(--border)",
                input: "var(--input)",
                ring: "var(--ring)",

                background: "var(--background)",
                foreground: "var(--foreground)",

                primary: {
                    DEFAULT: "var(--primary)",
                    foreground: "var(--primary-foreground)",
                },

                secondary: {
                    DEFAULT: "var(--secondary)",
                    foreground: "var(--secondary-foreground)",
                },

                destructive: {
                    DEFAULT: "var(--destructive)",
                    foreground: "var(--destructive-foreground)",
                },

                muted: {
                    DEFAULT: "var(--muted)",
                    foreground: "var(--muted-foreground)",
                },

                accent: {
                    DEFAULT: "var(--accent)",
                    foreground: "var(--accent-foreground)",
                },

                popover: {
                    DEFAULT: "var(--popover)",
                    foreground: "var(--popover-foreground)",
                },

                card: {
                    DEFAULT: "var(--card)",
                    foreground: "var(--card-foreground)",
                },

                sidebar: {
                    DEFAULT: "var(--sidebar)",
                    foreground: "var(--sidebar-foreground)",
                    primary: "var(--sidebar-primary)",
                    "primary-foreground": "var(--sidebar-primary-foreground)",
                    accent: "var(--sidebar-accent)",
                    "accent-foreground": "var(--sidebar-accent-foreground)",
                    border: "var(--sidebar-border)",
                    ring: "var(--sidebar-ring)",
                },

                // INI DIPINDAHKAN KE LEVEL YANG BENAR
                emerald: brand(0),
                teal: brand(1),
            },

            fontFamily: {
                sans: ["Noto Sans Variable", "sans-serif"],
                heading: ["Playfair Display Variable", "serif"],
            },

            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
        },
    },

    plugins: [
        require("@tailwindcss/forms"),
        require("tailwindcss/plugin")(({ addVariant }) => {
            // Atribut yang dipasang Base UI pada popup/overlay
            addVariant("data-open", "&[data-open]");
            addVariant("data-closed", "&[data-closed]");
            addVariant("data-starting-style", "&[data-starting-style]");
            addVariant("data-ending-style", "&[data-ending-style]");
            addVariant(
                "supports-backdrop-filter",
                "@supports (backdrop-filter: blur(0))",
            );
        }),
    ],
};
