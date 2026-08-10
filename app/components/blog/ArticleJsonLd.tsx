import { SITE_URL, resolveSeoDescription, type Post } from '@/lib/blog'

export default function ArticleJsonLd({ post }: { post: Post }) {
  const url = `${SITE_URL}/blog/${post.slug}`

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: resolveSeoDescription(post),
    image: post.cover_image ? [post.cover_image] : undefined,
    datePublished: post.published_at ?? post.created_at,
    dateModified: post.updated_at,
    author: post.author ? { '@type': 'Person', name: post.author.name } : { '@type': 'Organization', name: 'Menuberg' },
    publisher: {
      '@type': 'Organization',
      name: 'Menuberg',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      ...(post.category
        ? [{ '@type': 'ListItem', position: 3, name: post.category.name, item: `${SITE_URL}/blog/category/${post.category.slug}` }]
        : []),
      { '@type': 'ListItem', position: post.category ? 4 : 3, name: post.title, item: url },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
    </>
  )
}
