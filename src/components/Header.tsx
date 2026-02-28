import Link from 'next/link';

export default function Header() {
    const categories = [
        'LATEST', 'TECH', 'BEST PICKS', 'ENTERTAINMENT', 'HEALTH',
        'REVIEWS', 'HOME & GARDEN', 'DEALS', 'COMPARISONS', 'HACKS'
    ];

    return (
        <header className="bg-white px-4 sm:px-6 lg:px-8 pt-6">
            <div className="max-w-7xl mx-auto">
                {/* Top Section */}
                <div className="flex justify-between items-center pb-6">
                    <Link href="/" className="inline-block border-2 border-slate-900 px-2 py-1">
                        <span className="text-3xl font-black tracking-tighter text-slate-900 leading-tight uppercase">
                            Ilsanggam Life Studio
                        </span>
                    </Link>

                    <div className="flex items-center gap-6 text-slate-900">
                        <div className="hidden md:flex items-center gap-4">
                            {/* Simple Social Icons Placeholder */}
                            <span className="w-5 h-5 border border-slate-900 rounded flex items-center justify-center text-[10px] font-bold">𝕏</span>
                            <span className="w-5 h-5 border border-slate-900 rounded flex items-center justify-center text-[10px] font-bold">IG</span>
                            <span className="w-5 h-5 border border-slate-900 rounded flex items-center justify-center text-[10px] font-bold">FB</span>
                        </div>
                        <div className="h-6 w-[1px] bg-slate-200 hidden md:block"></div>
                        <button className="p-1">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                        <button className="p-1">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Sub-Navigation Section */}
                <nav className="border-t border-b border-dashed border-slate-300 py-3">
                    <ul className="flex flex-wrap justify-center sm:justify-between items-center gap-4 sm:gap-0">
                        {categories.map((cat) => (
                            <li key={cat}>
                                <Link
                                    href={`/category/${cat.toLowerCase().replace(/ /g, '-')}`}
                                    className="text-[11px] font-black tracking-widest text-slate-600 hover:text-black transition-colors"
                                >
                                    {cat}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </header>
    );
}
