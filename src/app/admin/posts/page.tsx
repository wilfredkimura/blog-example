"use client";
import { useEffect, useRef, useState } from "react";

export default function AdminPostsPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  // Multi-selects
  const [allCategories, setAllCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [allTags, setAllTags] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [published, setPublished] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageProgress, setImageProgress] = useState<number>(0);
  const [videoProgress, setVideoProgress] = useState<number>(0);
  // Gallery state (array of image URLs)
  const [gallery, setGallery] = useState<string[]>([]);
  // Per-file progress for multi-upload (keyed by index)
  const [galleryProgress, setGalleryProgress] = useState<Record<string, number>>({});
  const [posts, setPosts] = useState<Array<{ id: string; title: string; published: boolean; date: string; content?: string | null; categories?: { categoryId: string }[]; tags?: { tagId: string }[] }>>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const [isDraggingGallery, setIsDraggingGallery] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    try {
      const isEdit = !!editingId;
      const res = await fetch("/api/admin/posts", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isEdit
            ? { id: editingId, title, content, published, images: gallery, categories: selectedCategories, tags: selectedTags }
            : {
                title,
                content,
                categories: selectedCategories,
                tags: selectedTags,
                imageUrl: imageUrl || null,
                videoUrl: videoUrl || null,
                published,
                images: gallery,
              }
        ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || (editingId ? "Failed to update post" : "Failed to create post"));
      setStatus(editingId ? "Post updated" : "Post created");
      setTitle("");
      setContent("");
      setSelectedCategories([]);
      setSelectedTags([]);
      setImageUrl("");
      setVideoUrl("");
      setGallery([]);
      setPublished(true);
      setEditingId(null);
      await loadPosts();
    } catch (err: any) {
      setStatus(err.message);
    }
  }

  async function loadPosts() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/posts?take=100");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load posts");
      setPosts(data.posts || []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load posts";
      setLoadError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function deletePost(id: string) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/posts?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Failed to delete post");
      return;
    }
    await loadPosts();
  }

  async function togglePublished(p: { id: string; published: boolean }) {
    const res = await fetch("/api/admin/posts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, published: !p.published }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Failed to update");
      return;
    }
    await loadPosts();
  }

  async function loadTaxonomies() {
    try {
      const [cRes, tRes] = await Promise.all([
        fetch("/api/admin/categories"),
        fetch("/api/admin/tags"),
      ]);
      const [cData, tData] = await Promise.all([cRes.json(), tRes.json()]);
      if (cRes.ok) setAllCategories(cData.categories || []);
      if (tRes.ok) setAllTags(tData.tags || []);
    } catch {
      // ignore
    }
  }

  function validateFile(kind: "image" | "video", file: File): string | null {
    const isImage = kind === "image";
    const maxSize = isImage ? 5 * 1024 * 1024 : 50 * 1024 * 1024; // 5MB images, 50MB videos
    const okType = isImage ? file.type.startsWith("image/") : file.type.startsWith("video/");
    if (!okType) return `Please select a ${isImage ? "image" : "video"} file.`;
    if (file.size > maxSize) return `File too large. Max ${isImage ? "5MB" : "50MB"}.`;
    return null;
  }

  async function handleUpload(kind: "image" | "video", file: File | null) {
    if (!file) return;
    const err = validateFile(kind, file);
    if (err) { setUploadError(err); return; }
    setUploadError(null);

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/admin/upload");
      xhr.upload.onprogress = (e) => {
        if (!e.lengthComputable) return;
        const pct = Math.round((e.loaded / e.total) * 100);
        if (kind === "image") setImageProgress(pct);
        if (kind === "video") setVideoProgress(pct);
      };
      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            if (kind === "image") { setImageUrl(data.url); setImageProgress(0); }
            if (kind === "video") { setVideoUrl(data.url); setVideoProgress(0); }
            resolve();
          } else {
            setUploadError(data.error || "Upload failed");
            if (kind === "image") setImageProgress(0);
            if (kind === "video") setVideoProgress(0);
            reject(new Error(data.error || "Upload failed"));
          }
        } catch (e:any) {
          setUploadError("Unexpected server response");
          if (kind === "image") setImageProgress(0);
          if (kind === "video") setVideoProgress(0);
          reject(e);
        }
      };
      xhr.onerror = () => {
        setUploadError("Network error during upload");
        if (kind === "image") setImageProgress(0);
        if (kind === "video") setVideoProgress(0);
        reject(new Error("Network error"));
      };
      const fd = new FormData();
      fd.append("file", file);
      xhr.send(fd);
    });
  }

  // Remove a previously uploaded file from /public/uploads
  async function deleteUploaded(url: string) {
    if (!url || !url.startsWith("/uploads/")) return;
    try {
      await fetch(`/api/admin/upload?url=${encodeURIComponent(url)}`, { method: "DELETE" });
    } catch {
      // non-blocking cleanup failure
    }
  }

  async function handleGalleryUpload(files: FileList | File[] | null) {
    if (!files || (files instanceof FileList && files.length === 0)) return;
    const list: File[] = files instanceof FileList ? Array.from(files) : files;
    // Validate first
    for (const f of list) {
      const err = validateFile("image", f);
      if (err) { setUploadError(err); return; }
    }
    setUploadError(null);
    // Upload sequentially to keep UI simple (still shows per-file progress)
    for (let i = 0; i < list.length; i++) {
      const f = list[i];
      const key = `${Date.now()}_${i}_${f.name}`;
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/admin/upload");
        xhr.upload.onprogress = (e) => {
          if (!e.lengthComputable) return;
          const pct = Math.round((e.loaded / e.total) * 100);
          setGalleryProgress((prev) => ({ ...prev, [key]: pct }));
        };
        xhr.onload = () => {
          try {
            const data = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) {
              setGallery((prev) => [...prev, data.url]);
              setGalleryProgress((prev) => {
                const cp = { ...prev }; delete cp[key]; return cp;
              });
              resolve();
            } else {
              setUploadError(data.error || "Upload failed");
              setGalleryProgress((prev) => {
                const cp = { ...prev }; delete cp[key]; return cp;
              });
              reject(new Error(data.error || "Upload failed"));
            }
          } catch (e:any) {
            setUploadError("Unexpected server response");
            setGalleryProgress((prev) => {
              const cp = { ...prev }; delete cp[key]; return cp;
            });
            reject(e);
          }
        };
        xhr.onerror = () => {
          setUploadError("Network error during upload");
          setGalleryProgress((prev) => {
            const cp = { ...prev }; delete cp[key]; return cp;
          });
          reject(new Error("Network error"));
        };
        const fd = new FormData();
        fd.append("file", f);
        xhr.send(fd);
      });
    }
  }

  useEffect(() => {
    loadPosts();
    loadTaxonomies();
    // Prevent the browser from opening the dropped file instead of letting our zones handle it
    const preventDefaults = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const events = ["dragenter", "dragover", "dragleave", "drop"] as const;
    events.forEach((ev) => window.addEventListener(ev, preventDefaults, false));
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, preventDefaults, false));
    };
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Blog Management</h1>
      {loadError && (
        <div className="p-3 rounded-md border bg-red-50 text-red-700 text-sm">{loadError}</div>
      )}
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="w-full px-3 py-2 border rounded-md min-h-[200px]"
          placeholder="Content (HTML or Markdown)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm font-medium mb-2">Categories</div>
            <div className="grid grid-cols-2 gap-2">
              {allCategories.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(c.id)}
                    onChange={(e) => {
                      setSelectedCategories((prev) =>
                        e.target.checked ? [...prev, c.id] : prev.filter((id) => id !== c.id)
                      );
                    }}
                  />
                  {c.name}
                </label>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium mb-2">Tags</div>
            <div className="grid grid-cols-2 gap-2">
              {allTags.map((t) => (
                <label key={t.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(t.id)}
                    onChange={(e) => {
                      setSelectedTags((prev) =>
                        e.target.checked ? [...prev, t.id] : prev.filter((id) => id !== t.id)
                      );
                    }}
                  />
                  {t.name}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <input
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Image URL (optional)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <div
              className={`border border-dashed rounded-md p-6 min-h-28 flex items-center justify-center text-sm text-center cursor-pointer transition-colors ${isDraggingImage ? "bg-[var(--secondary)]" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setIsDraggingImage(true); }}
              onDragEnter={(e) => { e.preventDefault(); setIsDraggingImage(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDraggingImage(false); }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingImage(false);
                const file = e.dataTransfer.files?.[0] || null;
                handleUpload("image", file);
              }}
              onClick={() => imageInputRef.current?.click()}
            >
              Drag & drop image here or click to choose
              <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload("image", e.target.files?.[0] || null)} />
            </div>
            {imageUrl && (
              <div className="flex items-center gap-3">
                <img src={imageUrl} alt="cover" className="h-16 w-24 object-cover rounded border" />
                <button
                  type="button"
                  className="text-sm underline text-red-600"
                  onClick={async () => { await deleteUploaded(imageUrl); setImageUrl(""); }}
                >
                  Remove image
                </button>
              </div>
            )}
            {imageProgress > 0 && (
              <div className="h-2 bg-gray-200 rounded">
                <div className="h-2 bg-[var(--accent)] rounded" style={{ width: `${imageProgress}%` }} />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <input
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Video URL (optional)"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            <div
              className={`border border-dashed rounded-md p-6 min-h-28 flex items-center justify-center text-sm text-center cursor-pointer transition-colors ${isDraggingVideo ? "bg-[var(--secondary)]" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setIsDraggingVideo(true); }}
              onDragEnter={(e) => { e.preventDefault(); setIsDraggingVideo(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDraggingVideo(false); }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingVideo(false);
                const file = e.dataTransfer.files?.[0] || null;
                handleUpload("video", file);
              }}
              onClick={() => videoInputRef.current?.click()}
            >
              Drag & drop video here or click to choose
              <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleUpload("video", e.target.files?.[0] || null)} />
            </div>
            {videoUrl && (
              <div className="flex items-center gap-3">
                <video src={videoUrl} className="h-16 rounded border" />
                <button
                  type="button"
                  className="text-sm underline text-red-600"
                  onClick={async () => { await deleteUploaded(videoUrl); setVideoUrl(""); }}
                >
                  Remove video
                </button>
              </div>
            )}
            {videoProgress > 0 && (
              <div className="h-2 bg-gray-200 rounded">
                <div className="h-2 bg-[var(--accent)] rounded" style={{ width: `${videoProgress}%` }} />
              </div>
            )}
          </div>
        </div>
        {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Gallery</h3>
            <label className="text-xs underline cursor-pointer">
              Add images
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleGalleryUpload(e.target.files)}
              />
            </label>
          </div>
          <div
            className={`border border-dashed rounded-md p-6 min-h-28 flex items-center justify-center text-sm text-center cursor-pointer transition-colors ${isDraggingGallery ? "bg-[var(--secondary)]" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setIsDraggingGallery(true); }}
            onDragEnter={(e) => { e.preventDefault(); setIsDraggingGallery(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDraggingGallery(false); }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingGallery(false);
              handleGalleryUpload(e.dataTransfer.files || null);
            }}
          >
            Drag & drop multiple images here
          </div>
          {/* In-progress uploads */}
          {Object.keys(galleryProgress).length > 0 && (
            <div className="space-y-1">
              {Object.entries(galleryProgress).map(([k, pct]) => (
                <div key={k} className="h-2 bg-gray-200 rounded">
                  <div className="h-2 bg-[var(--accent)] rounded" style={{ width: `${pct}%` }} />
                </div>
              ))}
            </div>
          )}
          {/* Thumbnails with reorder/delete */}
          {gallery.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {gallery.map((url, idx) => (
                <div key={url + idx} className="border rounded-md p-1 flex flex-col items-center gap-1">
                  <img src={url} alt="gallery" className="h-20 w-full object-cover rounded" />
                  <div className="flex gap-2">
                    <button type="button" className="text-xs underline" disabled={idx === 0} onClick={() => {
                      if (idx === 0) return;
                      setGallery((prev) => {
                        const copy = [...prev];
                        const [it] = copy.splice(idx, 1);
                        copy.splice(idx - 1, 0, it);
                        return copy;
                      });
                    }}>Up</button>
                    <button type="button" className="text-xs underline" disabled={idx === gallery.length - 1} onClick={() => {
                      if (idx === gallery.length - 1) return;
                      setGallery((prev) => {
                        const copy = [...prev];
                        const [it] = copy.splice(idx, 1);
                        copy.splice(idx + 1, 0, it);
                        return copy;
                      });
                    }}>Down</button>
                    <button type="button" className="text-xs underline text-red-600" onClick={async () => {
                      const url = gallery[idx];
                      setGallery((prev) => prev.filter((_, i) => i !== idx));
                      await deleteUploaded(url);
                    }}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {(imageUrl || videoUrl) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {imageUrl && (
              <div>
                <div className="text-sm font-medium mb-1">Image preview</div>
                <img src={imageUrl} alt="preview" className="max-h-40 rounded-md object-cover border" />
              </div>
            )}
            {videoUrl && (
              <div>
                <div className="text-sm font-medium mb-1">Video preview</div>
                <video src={videoUrl} controls className="max-h-40 rounded-md border" />
              </div>
            )}
          </div>
        )}
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          Published
        </label>
        <div className="pt-2 flex items-center gap-3">
          <button type="submit" className="btn-accent px-4 py-2 rounded-md font-semibold">
            {editingId ? "Save Changes" : "Create Post"}
          </button>
          {editingId && (
            <button type="button" className="px-4 py-2 rounded-md border" onClick={() => {
              setEditingId(null);
              setTitle("");
              setContent("");
              setSelectedCategories([]);
              setSelectedTags([]);
              setImageUrl("");
              setVideoUrl("");
              setGallery([]);
              setPublished(true);
            }}>Cancel</button>
          )}
        </div>
        {status && <p className="text-sm mt-2">{status}</p>}
      </form>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Existing Posts</h2>
        {loading ? (
          <p className="text-sm">Loading…</p>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-[var(--secondary)] text-left">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Published</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="p-3">{p.title}</td>
                    <td className="p-3">{new Date(p.date).toLocaleDateString()}</td>
                    <td className="p-3">
                      <button onClick={() => togglePublished(p)} className="underline">
                        {p.published ? "Yes" : "No"}
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <a className="underline mr-3" href={`/posts/${p.id}`} target="_blank" rel="noopener">View</a>
                      <button className="underline mr-3" onClick={() => {
                        setEditingId(p.id);
                        setTitle(p.title);
                        setContent(p.content || "");
                        setPublished(p.published);
                        setSelectedCategories((p.categories || []).map((c) => c.categoryId));
                        setSelectedTags((p.tags || []).map((t) => t.tagId));
                        setGallery((p as any).images?.map((im: any) => im.url) || []);
                      }}>Edit</button>
                      <button className="underline text-red-600" onClick={() => deletePost(p.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
