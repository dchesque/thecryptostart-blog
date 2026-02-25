import { PostForm } from "@/components/admin/PostForm";

export default function NewPostPage() {
    return (
        <div className="space-y-6 max-w-[1200px] mx-auto pb-20">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Create New Post</h1>
                <p className="text-gray-500 mt-1">Write your content, configure SEO, and publish.</p>
            </div>

            <PostForm />
        </div>
    );
}
