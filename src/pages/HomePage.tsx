import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Post, BlogData } from '@/types';
import { fetchBlogPosts } from '../services/blogService';
import Tag from '../components/Tag';
import PostViewer from '../components/PostViewer';

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<BlogData>({ posts: [], availableTags: [] });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    useEffect(() => {
        const loadContent = async () => {
            setLoading(true);
            const blogContent = await fetchBlogPosts();
            setData(blogContent);
            setLoading(false);
        };
        loadContent();
    }, []);

    const filteredPosts = useMemo(() => {
        return data.posts.filter(post => {
            const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesTag = selectedTag ? post.tags.includes(selectedTag) : true;
            return matchesSearch && matchesTag;
        });
    }, [data.posts, searchQuery, selectedTag]);

    const recentPosts = useMemo(() => {
        return data.posts.slice(0, 3);
    }, [data.posts]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const handlePostClick = (post: Post) => {
        // 更新URL但不刷新页面，使用overlay展示
        window.history.pushState({}, '', `/posts/${post.id}`);
        setSelectedPost(post);
    };

    const handleClose = () => {
        // 返回首页
        window.history.pushState({}, '', '/');
        setSelectedPost(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4 dot-pattern">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Loading blog data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen dot-pattern selection:bg-indigo-100 selection:text-indigo-900">

            {/* Immersive Post Reader */}
            {selectedPost && (
                <PostViewer
                    post={selectedPost}
                    onClose={handleClose}
                />
            )}

            {/* Background Main Layout */}
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row">

                {/* Left Section: Branding & Navigation */}
                <header className="lg:w-1/3 lg:h-screen lg:sticky lg:top-0 px-8 py-12 lg:py-24 border-b lg:border-b-0 lg:border-r border-slate-200 bg-[#fafafa]/50 backdrop-blur-md">
                    <div className="flex flex-col h-full">
                        <div>
                            <h1 className="text-6xl font-black tracking-tighter text-slate-900 mb-2">{process.env.PUBLIC_BLOG_TITLE}</h1>
                            <div className="h-1 w-12 bg-slate-900 mb-6"></div>
                            <p className="text-slate-500 text-lg font-light leading-relaxed max-w-xs">{process.env.PUBLIC_BLOG_SUBTITLE}</p>
                        </div>

                        <div className="mt-16 space-y-12">
                            {/* Search */}
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Search articles..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-transparent border-b border-slate-200 py-2 focus:border-slate-900 outline-none transition-colors text-slate-900 placeholder:text-slate-400 font-medium"
                                />
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Discovery</h3>
                                <div className="flex flex-wrap gap-2">
                                    <Tag
                                        label="all"
                                        active={selectedTag === null}
                                        onClick={() => setSelectedTag(null)}
                                    />
                                    {data.availableTags.map(tag => (
                                        <Tag
                                            key={tag}
                                            label={tag}
                                            active={selectedTag === tag}
                                            onClick={() => setSelectedTag(tag)}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Recent Entries Brief */}
                            <div className="hidden lg:block">
                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6">Recent Additions</h3>
                                <div className="space-y-6">
                                    {recentPosts.map(post => (
                                        <button
                                            key={post.id}
                                            onClick={() => handlePostClick(post)}
                                            className="group block text-left"
                                        >
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-600 transition-colors">{formatDate(post.date)}</span>
                                            <span className="block text-sm font-semibold text-slate-800 leading-snug group-hover:underline underline-offset-4 decoration-2">{post.title || post.id}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-16 hidden lg:block">
                            <div className="flex space-x-6">
                                {process.env.PUBLIC_BLOG_GITHUB && <a href={process.env.PUBLIC_BLOG_GITHUB} target='_blank' className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">Github</a>}
                                <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">RSS</a>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Right Section: Content Feed */}
                <main className="flex-1 px-8 lg:px-20 py-12 lg:py-24 line-pattern">
                    <div className="max-w-3xl">
                        <header className="mb-16 flex justify-between items-end">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Journal Entries</h2>
                                <p className="text-slate-400 text-sm mt-1">{filteredPosts.length} matches found</p>
                            </div>
                            <div className="hidden sm:block h-px flex-1 mx-8 bg-slate-100"></div>
                        </header>

                        <div className="space-y-24">
                            {filteredPosts.length > 0 ? (
                                filteredPosts.map((post, idx) => (
                                    <article key={post.id} className="group relative">
                                        {/* Index Numbering for style */}
                                        <div className="absolute -left-12 lg:-left-16 top-0 hidden lg:block text-5xl font-black text-slate-100 pointer-events-none group-hover:text-slate-200 transition-colors">
                                            {(idx + 1).toString().padStart(2, '0')}
                                        </div>

                                        <div className="flex items-center space-x-4 mb-4">
                                            <time className="text-xs font-bold text-slate-400 uppercase tracking-widest">{formatDate(post.date)}</time>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">{post.readTime}</span>
                                        </div>

                                        <h3
                                            className="text-3xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors cursor-pointer leading-tight"
                                            onClick={() => handlePostClick(post)}
                                        >
                                            {post.title}
                                        </h3>

                                        <p className="text-slate-500 text-lg leading-relaxed mb-6 line-clamp-3">
                                            {post.excerpt}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex space-x-2">
                                                {post.tags.map(tag => (
                                                    <span key={tag} className="text-[10px] font-black text-slate-400 uppercase border border-slate-200 px-2 py-0.5 rounded">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => handlePostClick(post)}
                                                className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center group-hover:translate-x-1 transition-transform"
                                            >
                                                READ ENTRY <span className="ml-2">→</span>
                                            </button>
                                        </div>
                                    </article>
                                ))
                            ) : (
                                <div className="py-24 text-center">
                                    <div className="inline-block p-4 rounded-full bg-slate-50 text-slate-300 mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900">No entries found</h4>
                                    <p className="text-slate-500 mt-2">Try adjusting your search or filters.</p>
                                    <button
                                        onClick={() => { setSearchQuery(''); setSelectedTag(null); }}
                                        className="mt-6 text-xs font-black uppercase tracking-widest border-b-2 border-slate-900 pb-1"
                                    >
                                        RESET ALL FILTERS
                                    </button>
                                </div>
                            )}
                        </div>

                        <footer className="mt-32 pt-12 border-t border-slate-200 lg:hidden">
                            <div className="flex items-center justify-between">
                                <div className="flex space-x-6">
                                    <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">Twitter</a>
                                    <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">Github</a>
                                    <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">RSS</a>
                                </div>
                                <span className="text-[10px] font-bold text-slate-300 tracking-[0.4em]"></span>
                            </div>
                        </footer>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default HomePage;
