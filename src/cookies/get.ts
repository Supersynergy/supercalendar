import { cookies } from "next/headers";
import { DEFAULT_VALUES, THEME_COOKIE_NAME } from "@/constants/cookies.const";
import { THEMES_VALUES } from "@/constants/theme.const";

export type TTheme = (typeof THEMES_VALUES)[number];

export async function getTheme(): Promise<TTheme> {
  const cookieStore = await cookies();
  const theme = cookieStore.get(THEME_COOKIE_NAME)?.value;
  if (!THEMES_VALUES.includes(theme as TTheme)) return DEFAULT_VALUES.theme as TTheme;
  return theme as TTheme;
}
