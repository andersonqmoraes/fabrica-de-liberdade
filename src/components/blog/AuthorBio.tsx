import { Link } from "@/i18n/routing";
import { User, ArrowRight } from "lucide-react";
import type { Author } from "@/lib/authors";
import type { Locale } from "@/types";

interface AuthorBioProps {
  author: Author;
  locale: Locale;
}

export function AuthorBio({ author, locale }: AuthorBioProps) {
  const l = locale;

  const aboutLabel =
    l === "pt-BR" ? "Sobre o autor" : l === "en" ? "About the author" : "Sobre el autor";
  const moreLabel =
    l === "pt-BR" ? "Ver perfil completo" : l === "en" ? "View full profile" : "Ver perfil completo";

  return (
    <aside className="card p-6 my-10 border-l-4 border-l-brand-500">
      <div className="flex items-start gap-5">
        <div className="w-16 h-16 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
          <User className="w-8 h-8 text-brand-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs uppercase tracking-wider text-gray-600 mb-1">
            {aboutLabel}
          </div>
          <h3 className="font-display font-bold text-lg text-white mb-1">
            {author.name}
          </h3>
          <div className="text-sm text-brand-400 mb-3">{author.role[l]}</div>
          <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-4">
            {author.bio[l]}
          </p>
          <Link
            href={`/autor/${author.slug}` as any}
            className="inline-flex items-center gap-1 text-sm text-brand-400 hover:text-brand-300 transition-colors font-medium"
          >
            {moreLabel}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
