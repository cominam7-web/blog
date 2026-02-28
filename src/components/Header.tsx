import Link from 'next/link';

export default function Header() {
    const categories = [
        { name: 'LATEST', href: '/' },
        { name: 'TECH', href: '/category/tech' },
        { name: 'BEST PICKS', href: '/category/best-picks' },
        { name: 'ENTERTAINMENT', href: '/category/entertainment' },
        { name: 'HEALTH', href: '/category/health' },
        { name: 'REVIEWS', href: '/category/reviews' },
        { name: 'HOME & GARDEN', href: '/category/home-&-garden' },
        { name: 'DEALS', href: '/category/deals' },
        { name: 'COMPARISONS', href: '/category/comparisons' },
        { name: 'HACKS', href: '/category/hacks' }
    ];

    return (
        <header className="bg-white px-4 sm:px-6 lg:px-8 pt-6 sticky top-0 z-50 border-b border-transparent hover:border-slate-100 transition-colors bg-white/95 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto">
                {/* Top Section */}
                <div className="flex justify-between items-center pb-6">
                    <Link href="/" className="inline-block border-2 border-slate-900 px-3 py-1 hover:bg-slate-900 hover:text-white transition-all duration-300 transform active:scale-95">
                        <span className="text-3xl font-black tracking-tighter leading-tight uppercase">
                            Ilsanggam Life Studio
                        </span>
                    </Link>

                    <div className="flex items-center gap-6 text-slate-900">
                        <div className="hidden md:flex items-center gap-4">
                            <button className="w-6 h-6 border-2 border-slate-900 rounded-sm flex items-center justify-center text-[10px] font-black hover:bg-slate-900 hover:text-white transition-colors">X</button>
                            <button className="w-6 h-6 border-2 border-slate-900 rounded-sm flex items-center justify-center text-[10px] font-black hover:bg-slate-900 hover:text-white transition-colors">IG</button>
                            <button className="w-6 h-6 border-2 border-slate-900 rounded-sm flex items-center justify-center text-[10px] font-black hover:bg-slate-900 hover:text-white transition-colors">FB</button>
                        </div>
                        <div className="h-6 w-[2px] bg-slate-200 hidden md:block"></div>
                        <button className="p-1 hover:text-blue-600 transition-colors" aria-label="Search">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                        <button className="p-1 hover:text-blue-600 transition-colors md:hidden" aria-label="Menu">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Sub-Navigation Section */}
                <nav className="border-t border-b border-dashed border-slate-300 py-3 mb-2 overflow-x-auto no-scrollbar">
                    <ul className="flex justify-between items-center gap-6 min-w-max">
                        {categories.map((cat) => (
                            <li key={cat.name}>
                                <Link
                                    href={cat.href}
                                    className="text-[11px] font-black tracking-widest text-slate-500 hover:text-blue-600 transition-colors cursor-pointer block py-1"
                                >
                                    {cat.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </header>
    );
}
