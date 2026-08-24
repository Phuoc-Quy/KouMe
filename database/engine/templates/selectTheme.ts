type ChalkStyle = (text: string) => string;

type ColorMap = Readonly<Record<string, ChalkStyle>>;

export function createSelectTheme(colors: ColorMap) {
  return {
    indexMode: 'number' as const,

    style: {
      highlight(text: string): string {
        for (const [label, color] of Object.entries(colors)) {
          if (text.includes(label)) {
            return color(text);
          }
        }

        return text;
      },
    },
  };
}
