"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PostForm } from "@/components/admin/PostForm";
import { Loader2 } from "lucide-react";

export default function EditPostPage() {
    const params = useParams();
    const router = useRouter();
    const [initialData, setInitialData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await fetch(`/api/admin/posts/${params.id}`);
                if (!res.ok) {
                    if (res.status === 404) {
                        alert("Post not found");
                        router.push("/admin/posts");
                        return;
                    }
                    throw new Error("Failed to fetch post");
                }
                const data = await res.json();
                setInitialData(data);
            } catch (error) {
                console.error(error);
                alert("Failed to load post for editing.");
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) {
            fetchPost();
        }
    }, [params.id, router]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p>Loading post data...</p>
            </div>
        );
    }

    if (!initialData) return null;

    return (
        <div className="space-y-6 max-w-[1200px] mx-auto pb-20">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Edit Post</h1>
                <p className="text-gray-500 mt-1">Update content, SEO settings, and metadata.</p>
            </div>

            <PostForm initialData={initialData} />
        </div>
    );
}
