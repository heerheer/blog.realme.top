import React, { useState, useEffect, useRef } from 'react';
import { Post } from '@/types';
import Tag from './Tag';
import MarkdownRenderer from './MarkdownRenderer';

interface PostViewerProps {
    post: Post;
    onClose: () => void;
}

const PostViewer: React.FC<PostViewerProps> = ({ post, onClose }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsExpanded(false);
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [post]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-10 transition-all duration-500 bg-black/30 backdrop-blur-sm">
            <div
                className={`
          relative bg-[#fefefe] shadow-2xl overflow-hidden
          bottom-sheet-transition
          ${isExpanded || window.innerWidth >= 1024 ? 'h-dvh lg:h-full lg:rounded-xl' : 'h-[60vh] rounded-t-2xl'}
          w-full lg:max-w-6xl
        `}
            >
                {/* Control Bar / Header */}
                <div className="sticky top-0 bg-white/90 backdrop-blur px-6 lg:px-10 py-5 flex justify-between items-center border-b border-slate-100 z-20">
                    <button
                        onClick={onClose}
                        className="flex items-center text-xs font-black text-slate-900 hover:text-indigo-600 transition-colors group"
                    >
                        <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> BACK
                    </button>

                    <div className="flex-1 flex justify-center">
                        <div
                            className="w-10 h-1 bg-slate-200 rounded-full lg:hidden cursor-pointer hover:bg-slate-300 transition-colors"
                            onClick={() => setIsExpanded(!isExpanded)}
                        ></div>
                    </div>

                    <div className="flex space-x-2">
                        {post.tags.slice(0, 2).map(tag => (
                            <Tag key={tag} label={tag} />
                        ))}
                    </div>
                </div>

                {/* Scrollable Content */}
                <div
                    ref={contentRef}
                    onScroll={(e) => {
                        const target = e.currentTarget;
                        if (target.scrollTop > 50 && !isExpanded) {
                            setIsExpanded(true);
                        }
                    }}
                    className="h-full overflow-y-auto px-6 md:px-16 lg:px-24 py-12 lg:py-20 no-scrollbar pb-32 bg-[#fefefe]"
                >
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center space-x-4 mb-8">
                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                                {formatDate(post.date)}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">
                                {post.readTime}
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-8">
                            {post.title}
                        </h1>

                        <div className="h-1.5 w-20 bg-slate-900 mb-16"></div>

                        <MarkdownRenderer content={post.content} />

                        <div className="mt-24 pt-12 border-t border-slate-100 flex items-center justify-between">
                            <p className="text-xs text-slate-400 font-medium italic">End of Journal Entry</p>
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-slate-900 text-white text-xs font-bold rounded-full hover:bg-indigo-600 transition-colors"
                            >
                                CLOSE
                            </button>
                        </div>
                    </div>
                </div>

                {/* Expansion trigger overlay for mobile when not expanded */}
                {!isExpanded && (
                    <div
                        className="absolute inset-0 top-15 pointer-events-auto lg:hidden"
                        onClick={() => setIsExpanded(true)}
                    />
                )}
            </div>
        </div>
    );
};

export default PostViewer;
