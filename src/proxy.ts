import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Aplica i18n em todas as rotas exceto assets estáticos
    "/((?!_next|_vercel|.*\\..*).*)",
  ],
};
