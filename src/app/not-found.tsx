import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-slate-300 mb-4">404</h1>
      <h2 className="text-xl font-semibold text-slate-700 mb-2">
        페이지를 찾을 수 없습니다
      </h2>
      <p className="text-slate-500 mb-8 max-w-md">
        요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          홈으로 돌아가기
        </Link>
        <Link
          href="/category/latest"
          className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
        >
          최신 글 보기
        </Link>
      </div>
    </div>
  );
}
