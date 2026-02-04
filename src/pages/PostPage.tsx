import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Post } from '@/types';
import { fetchPostById } from '../services/blogService';
import PostViewer from '../components/PostViewer';

const PostPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const loadPost = async () => {
            if (!id) {
                setError(true);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const fetchedPost = await fetchPostById(id);
                if (fetchedPost) {
                    setPost(fetchedPost);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error('Error loading post:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        loadPost();
    }, [id]);

    const handleClose = () => {
        navigate('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4 dot-pattern">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Loading post...</p>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4 dot-pattern">
                <div className="text-6xl text-slate-200 mb-4">404</div>
                <h2 className="text-2xl font-bold text-slate-900">Post Not Found</h2>
                <p className="text-slate-500">The post you're looking for doesn't exist.</p>
                <button
                    onClick={handleClose}
                    className="mt-6 px-6 py-2 text-xs font-black uppercase tracking-widest border-2 border-slate-900 hover:bg-slate-900 hover:text-white transition-colors"
                >
                    Go Back Home
                </button>
            </div>
        );
    }

    return <PostViewer post={post} onClose={handleClose} />;
};

export default PostPage;
