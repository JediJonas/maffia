// @ts-check
/**
 * Vite-tillägg som lägger in <link rel="preload"> för typsnitten i index.html.
 * Utan det hittar webbläsaren typsnittsfilerna först när JS och CSS har
 * laddats, och då hinner reservtypsnittet visas en stund (blinket).
 * Bara latin-filerna förladdas: det är dem svensk text behöver.
 */

/** Början av filnamnen, utan Vites hash. */
const PRELOADED_FONTS = [
  'archivo-latin-wght-normal-',
  'big-shoulders-display-latin-900-normal-',
  'comic-neue-latin-700-normal-',
  'courier-prime-latin-700-normal-',
];

/** @returns {import('vite').Plugin} */
export function preloadFonts() {
  return {
    name: 'maffia-preload-fonts',
    apply: 'build',
    transformIndexHtml(_html, context) {
      const files = Object.keys(context.bundle ?? {});
      return PRELOADED_FONTS.flatMap((prefix) => {
        const file = files.find((name) => name.includes(`/${prefix}`) && name.endsWith('.woff2'));
        if (!file) {
          throw new Error(`Hittade ingen typsnittsfil för ${prefix} att förladda.`);
        }
        return [{
          tag: 'link',
          attrs: { rel: 'preload', href: `./${file}`, as: 'font', type: 'font/woff2', crossorigin: '' },
          injectTo: 'head',
        }];
      });
    },
  };
}
