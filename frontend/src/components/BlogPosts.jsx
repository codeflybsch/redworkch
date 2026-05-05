import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "../api";

export default function BlogPosts() {
  const [posts, setPosts] = useState([]);
  const [start, setStart] = useState(0);

  useEffect(() => {
    api.get("/blogs").then((r) => setPosts(r.data)).catch(() => {});
  }, []);

  const visible = 3;
  const items = [];
  if (posts.length > 0) {
    for (let i = 0; i < Math.min(visible, posts.length); i++) {
      items.push(posts[(start + i) % posts.length]);
    }
  }

  return (
    <section id="blog" className="py-24 bg-[#f1f5fb]">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-6">
          <div className="flex gap-3">
            <button onClick={() => posts.length && setStart((s) => (s - 1 + posts.length) % posts.length)} className="text-[#22C55E] hover:scale-110 transition-transform" aria-label="vorherig">
              <ChevronLeft size={28} strokeWidth={2.5} />
            </button>
            <button onClick={() => posts.length && setStart((s) => (s + 1) % posts.length)} className="text-[#22C55E] hover:scale-110 transition-transform" aria-label="weiter">
              <ChevronRight size={28} strokeWidth={2.5} />
            </button>
          </div>
          <div className="text-center mx-auto">
            <h2 className="text-[34px] md:text-[44px] font-extrabold text-[#0f172a]">
              <span className="section-title-hash">#</span> Was wir geschrieben haben ?
            </h2>
            <p className="text-[#E63946] font-bold tracking-wider text-sm mt-2">UNSERE INHALTE</p>
          </div>
          <div className="w-32 hidden md:block" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((post) => (
            <article key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-card group cursor-pointer hover:-translate-y-1 transition-transform duration-300">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <span className="absolute top-4 left-4 bg-[#FFC107] text-black text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded">
                  {post.category}
                </span>
              </div>
              <div className="p-6">
                <p className="text-xs text-[#94a3b8] mb-2">{post.date}</p>
                <h3 className="text-[18px] font-bold text-[#0f172a] leading-snug group-hover:text-[#E63946] transition-colors">
                  {post.title}
                </h3>
                {post.excerpt && <p className="text-sm text-[#64748b] mt-2 line-clamp-2">{post.excerpt}</p>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
