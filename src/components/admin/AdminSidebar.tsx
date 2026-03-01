'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { href: '/admin/posts', label: 'Posts', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { href: '/admin/comments', label: 'Comments', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-56 bg-slate-900 text-white min-h-screen flex flex-col flex-shrink-0">
            <div className="p-5 border-b border-slate-700">
                <Link href="/" className="text-xs font-bold tracking-widest text-slate-400 uppercase hover:text-white transition-colors">
                    ← ILSANGGAM
                </Link>
                <h2 className="text-lg font-black tracking-tight mt-2">Admin</h2>
            </div>
            <nav className="flex-1 p-3">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/admin' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 ${isActive
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                            </svg>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-slate-700">
                <Link
                    href="/admin/posts/new"
                    className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 px-4 rounded-lg transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    New Post
                </Link>
            </div>
        </aside>
    );
}
