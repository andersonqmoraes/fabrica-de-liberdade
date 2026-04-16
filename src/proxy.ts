import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Aplica i18n em rotas de página — exclui API, assets estáticos e internos do Next
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
