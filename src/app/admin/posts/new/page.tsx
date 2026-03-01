import PostEditor from '@/components/admin/PostEditor';

export default function NewPostPage() {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-8">New Post</h1>
            <PostEditor mode="create" />
        </div>
    );
}
