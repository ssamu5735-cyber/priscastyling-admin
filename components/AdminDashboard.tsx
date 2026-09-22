'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { account, appwriteReady, createProduct, deleteProduct, listAllProducts, updateProduct, uploadImage } from '@/src/appwrite';
import { money, type Product } from '@/src/data';
import { ArrowLeft, Check, ImagePlus, LogOut, PackagePlus, Pencil, Trash2, X } from 'lucide-react';

const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'oluwarotimi0003@gmail.com';
const empty: Product = { name: '', slug: '', category: 'Ready-to-Wear', description: '', price: 0, sizes: ['S', 'M', 'L'], colours: ['Black'], image: '', gallery: [], status: 'Draft', hasDiscount: false, originalPrice: 0, discountLabel: '' };

/* Real brand mark — same file the storefront uses. */
function Monogram({ size = 40 }: { size?: number }) {
  return <Image src="/images/logo-mark.png" alt="Priscastyling" width={size} height={size} className="shrink-0 object-contain" style={{ width: size, height: size }} />;
}

export default function AdminDashboard() {
  const [session, setSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState(adminEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { account.get().then(() => setSession(true)).catch(() => {}).finally(() => setCheckingSession(false)); }, []);
  useEffect(() => { if (session) listAllProducts().then(setProducts).catch(e => setError(e.message)); }, [session]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!appwriteReady) { setError("Appwrite isn't connected yet — add the database, table and storage bucket IDs to this deployment's environment first."); return; }
    if (email.toLowerCase() !== adminEmail.toLowerCase()) { setError('Use the approved Appwrite administrator email.'); return; }
    setLoading(true);
    try { await account.createEmailPasswordSession(email, password); setSession(true); }
    catch (err) { setError(err instanceof Error ? err.message : 'Sign-in failed.'); }
    finally { setLoading(false); }
  };
  const signOut = async () => { await account.deleteSession('current').catch(() => {}); setSession(false); };
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editing) return; setLoading(true);
    try {
      const saved = editing.$id ? await updateProduct(editing.$id, editing) : await createProduct(editing);
      setProducts(v => editing.$id ? v.map(p => p.$id === saved.$id ? saved : p) : [saved, ...v]);
      setEditing(null);
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not save this piece.'); }
    finally { setLoading(false); }
  };
  const remove = async (p: Product) => { if (!p.$id || !confirm(`Delete ${p.name}?`)) return; await deleteProduct(p.$id); setProducts(v => v.filter(x => x.$id !== p.$id)); };
  const chooseImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f && editing) {
      setLoading(true);
      try { setEditing({ ...editing, image: await uploadImage(f) }); }
      catch (err) { setError(err instanceof Error ? err.message : 'Image upload failed.'); }
      finally { setLoading(false); }
    }
  };

  if (checkingSession) return <main className="grid min-h-screen place-items-center" style={{ background: 'var(--dusk)' }} />;

  if (!session) return (
    <main className="min-h-screen" style={{ background: 'var(--dusk)' }}>
      <div className="shell flex min-h-screen items-center justify-center py-16">
        <div className="w-full max-w-md rounded-[28px] bg-[var(--white)] p-8 text-[var(--ink)]">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--rose-deep)]"><ArrowLeft size={16} /> Back to public website</Link>
          <div className="mt-8"><Image src="/images/logo-full.png" alt="Priscastyling — Lagos Atelier" width={320} height={170} className="w-40 object-contain" /></div>
          <p className="label mt-6">Private atelier access</p>
          <h1 className="serif mt-3 text-4xl">Admin sign in.</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Use the Appwrite account created for the approved designer email.</p>
          <form onSubmit={signIn} className="mt-7 grid gap-4">
            <label className="text-[13px] font-medium">Approved email<input className="input mt-2" value={email} onChange={e => setEmail(e.target.value)} type="email" required /></label>
            <label className="text-[13px] font-medium">Appwrite password<input className="input mt-2" value={password} onChange={e => setPassword(e.target.value)} type="password" required /></label>
            {!appwriteReady && <p className="rounded-xl bg-[var(--blush)]/40 p-3 text-sm leading-6 text-[var(--rose-deep)]">Appwrite isn't connected yet. Add <code>NEXT_PUBLIC_APPWRITE_DATABASE_ID</code>, the products table ID and storage bucket ID to this deployment's environment, then create the designer account inside Appwrite.</p>}
            {error && <p className="rounded-xl bg-red-50 p-3 text-sm leading-6 text-red-800">{error}</p>}
            <button className="btn btn-dark w-full" disabled={loading || !appwriteReady}>{loading ? 'Signing in…' : 'Enter dashboard'}</button>
          </form>
        </div>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen" style={{ background: 'var(--paper)' }}>
      <header className="border-b border-[var(--line)] bg-[var(--white)]">
        <div className="shell flex h-[78px] items-center justify-between">
          <div className="flex items-center gap-3">
            <Monogram />
            <div><strong className="serif block text-xl leading-none">Atelier dashboard</strong><small className="mt-1 block text-[11px] text-[var(--muted)]">Priscastyling</small></div>
          </div>
          <div className="flex items-center gap-3">
            <a href={process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || 'https://priscastyling-customer.netlify.app'} className="btn btn-line !px-4 !py-2.5 text-sm">View public site</a>
            <button onClick={signOut} className="btn btn-dark !px-4 !py-2.5 text-sm"><LogOut size={15} /> Sign out</button>
          </div>
        </div>
      </header>

      <div className="shell grid gap-10 py-12 lg:grid-cols-[.75fr_1.25fr]">
        <aside>
          <p className="label">Welcome back</p>
          <h1 className="serif mt-3 text-5xl">Your collection,<br />in your hands.</h1>
          <p className="mt-5 max-w-sm leading-7 text-[var(--muted)]">Add, edit and publish pieces to the customer storefront. Orders and enquiries continue through WhatsApp.</p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="card p-4"><strong className="serif text-3xl">{products.filter(p => p.status === 'Published').length}</strong><span className="mt-1 block text-xs text-[var(--muted)]">Published</span></div>
            <div className="card p-4"><strong className="serif text-3xl">{products.filter(p => p.status !== 'Published').length}</strong><span className="mt-1 block text-xs text-[var(--muted)]">In studio</span></div>
          </div>
          <button onClick={() => setEditing({ ...empty, slug: `piece-${Date.now()}` })} className="btn btn-soft mt-8 w-full"><PackagePlus size={18} /> Add new piece</button>
          <div className="mt-5 rounded-2xl bg-[var(--blush)]/40 p-5 text-sm leading-6 text-[var(--rose-deep)]">
            <strong className="block">Publishing tip</strong> Keep categories consistent so filters make sense on the storefront — try Ready-to-Wear, Bespoke &amp; Custom, Bridal, Pageant &amp; Occasion, Children&apos;s Fashion, Restyling &amp; Alterations, Ankara or Adire.
          </div>
        </aside>

        <section>
          <div className="mb-5 flex items-center justify-between">
            <div><p className="label">Live catalogue</p><h2 className="serif mt-2 text-3xl">Your pieces</h2></div>
            <span className="text-sm text-[var(--muted)]">{appwriteReady ? 'Appwrite connected' : 'Appwrite not connected'}</span>
          </div>
          {products.length === 0 && (
            <div className="card p-8 text-center">
              <p className="serif text-2xl">Nothing here yet.</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Add your first piece — it will appear on the customer site once you publish it.</p>
            </div>
          )}
          <div className="grid gap-4">
            {products.map(p => (
              <div className="card flex gap-4 p-3 sm:p-4" key={p.$id || p.slug}>
                <div className="arch relative size-24 shrink-0 overflow-hidden bg-[var(--paper)] sm:size-28">
                  {p.image ? <Image src={p.image} alt={p.name} fill className="object-cover" /> : <div className="grid h-full place-items-center text-[10px] text-[var(--muted)]">No photo</div>}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-medium text-[var(--muted)]">{p.category} · {p.status}</div>
                      <h3 className="serif mt-1 text-xl">{p.name}</h3>
                    </div>
                    <strong className="text-right">
                      {p.hasDiscount && p.originalPrice && <del className="mr-2 text-xs font-normal text-[var(--muted)]">{money(p.originalPrice)}</del>}
                      {money(p.price)}
                      {p.hasDiscount && <span className="ml-2 rounded-full bg-[var(--blush)] px-2 py-1 text-[10px] text-[var(--rose-deep)]">{p.discountLabel || 'Offer'}</span>}
                    </strong>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">{p.description}</p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => setEditing(p)} className="btn btn-line !px-3 !py-2 text-xs"><Pencil size={14} /> Edit</button>
                    {p.status !== 'Published' && (
                      <button onClick={async () => { if (p.$id) { const updated = await updateProduct(p.$id, { status: 'Published' }); setProducts(v => v.map(x => x.$id === p.$id ? updated : x)); } }} className="btn btn-dark !px-3 !py-2 text-xs"><Check size={14} /> Publish</button>
                    )}
                    <button onClick={() => remove(p)} className="rounded-full border border-red-200 px-3 py-2 text-xs font-medium text-red-700"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--dusk)]/70 p-4">
          <div className="mx-auto my-8 max-w-2xl rounded-[28px] bg-[var(--white)] p-6">
            <div className="flex items-center justify-between">
              <div><p className="label">Edit catalogue</p><h2 className="serif mt-2 text-3xl">{editing.name || 'New piece'}</h2></div>
              <button onClick={() => setEditing(null)} className="rounded-full border border-[var(--line)] p-2" aria-label="Close"><X size={18} /></button>
            </div>
            <form onSubmit={save} className="mt-7 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-[13px] font-medium">Piece name<input className="input mt-2" required value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} /></label>
                <label className="text-[13px] font-medium">Price<input className="input mt-2" required type="number" value={editing.price} onChange={e => setEditing({ ...editing, price: Number(e.target.value) })} /></label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex items-center gap-3 rounded-xl border border-[var(--line)] p-3 text-[13px] font-medium"><input type="checkbox" checked={Boolean(editing.hasDiscount)} onChange={e => setEditing({ ...editing, hasDiscount: e.target.checked })} /> Show discount</label>
                {editing.hasDiscount && <label className="text-[13px] font-medium">Original price<input className="input mt-2" type="number" min="0" value={editing.originalPrice || ''} onChange={e => setEditing({ ...editing, originalPrice: Number(e.target.value) })} /></label>}
              </div>
              <label className="text-[13px] font-medium">Discount label<input className="input mt-2" placeholder="Limited offer" value={editing.discountLabel || ''} onChange={e => setEditing({ ...editing, discountLabel: e.target.value })} /></label>
              <label className="text-[13px] font-medium">Description<textarea className="input mt-2" rows={3} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} /></label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-[13px] font-medium">Category
                  <input className="input mt-2" list="category-options" required value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })} placeholder="e.g. Ready-to-Wear" />
                  <datalist id="category-options">
                    <option value="Ready-to-Wear" /><option value="Bespoke & Custom" /><option value="Bridal" /><option value="Pageant & Occasion" /><option value="Children's Fashion" /><option value="Restyling & Alterations" /><option value="Ankara" /><option value="Adire" />
                  </datalist>
                </label>
                <label className="text-[13px] font-medium">Status
                  <select className="input mt-2" value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value as Product['status'] })}>
                    <option>Draft</option><option>Published</option><option>Coming soon</option><option>Sold out</option>
                  </select>
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-[13px] font-medium">Sizes<input className="input mt-2" value={editing.sizes.join(', ')} onChange={e => setEditing({ ...editing, sizes: e.target.value.split(',').map(x => x.trim()).filter(Boolean) })} /></label>
                <label className="text-[13px] font-medium">Colours<input className="input mt-2" value={editing.colours.join(', ')} onChange={e => setEditing({ ...editing, colours: e.target.value.split(',').map(x => x.trim()).filter(Boolean) })} /></label>
              </div>
              <label className="text-[13px] font-medium">Cover image<input className="input mt-2" type="file" accept="image/*" onChange={chooseImage} /></label>
              <div className="arch relative aspect-[3/1] overflow-hidden bg-[var(--blush)]/25">
                {editing.image ? <Image src={editing.image} alt="Cover preview" fill className="object-cover" /> : <div className="grid h-full place-items-center text-sm text-[var(--muted)]">No photo yet</div>}
                <div className="absolute bottom-2 left-2 flex items-center gap-2 rounded-full bg-[var(--white)]/90 px-3 py-1 text-xs font-medium"><ImagePlus size={14} /> Cover preview</div>
              </div>
              <button className="btn btn-dark w-full" disabled={loading}>{loading ? 'Saving…' : 'Save piece'}</button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
