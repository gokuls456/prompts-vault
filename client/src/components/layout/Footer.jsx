import { Link } from 'react-router-dom';

const links = {
  Platform: [
    { label: 'Browse Prompts', to: '/' },
    { label: 'Categories', to: '/#categories' },
  ],
  Account: [
    { label: 'Sign In', to: '/login' },
    { label: 'Register', to: '/register' },
  ],
};

export default function Footer() {
  return (
    <footer className="relative mt-20 border-t border-white/5">
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="font-display font-bold text-xl tracking-tight">
                Prompt<span className="gradient-text">Vault</span>
              </span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              The ultimate platform for discovering, copying, and sharing AI-generated image and video prompts.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {['Twitter', 'GitHub', 'Discord'].map((s) => (
                <button
                  key={s}
                  className="w-9 h-9 glass rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:border-violet-500/40 transition-all text-xs"
                  title={s}
                >
                  {s[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">{section}</h4>
              <ul className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="text-sm text-white/50 hover:text-white transition-colors duration-200"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
          <p className="text-xs text-white/25">
            © {new Date().getFullYear()} PromptVault. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-white/25">
            <span>Built with</span>
            <span className="gradient-text font-medium">React + Node.js</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
