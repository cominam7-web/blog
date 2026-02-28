import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-slate-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-slate-500 text-sm">
                    © {new Date().getFullYear()} AI Auto Blog. All rights reserved.
                </div>

                <nav className="flex items-center gap-8 text-sm font-medium text-slate-600">
                    <Link href="/" className="hover:text-blue-600 transition-colors">
                        Home
                    </Link>
                    <Link href="/about" className="hover:text-blue-600 transition-colors">
                        About
                    </Link>
                    <Link href="/privacy" className="hover:text-blue-600 transition-colors">
                        Privacy
                    </Link>
                </nav>
            </div>
        </footer>
    );
}
