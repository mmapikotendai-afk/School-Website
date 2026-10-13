import Link from 'next/link';

export default function NewsLoading() {
  return <>
    <section className="page-hero"><div className="container">
      <nav aria-label="Breadcrumb" className="breadcrumbs"><Link href="/">Home</Link><span>/</span><span aria-current="page">News</span></nav>
      <h1>From our school community.</h1>
      <p>School announcements, achievements and stories, published by the authorised website team.</p>
    </div><span className="page-hero-rule" aria-hidden="true"/></section>
    <section className="section public-listing" aria-busy="true"><div className="container" role="status">
      <p>Loading school news…</p>
    </div></section>
  </>;
}
