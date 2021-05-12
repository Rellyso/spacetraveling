import Prismic from '@prismicio/client'
import { GetStaticProps } from 'next';
import { FiCalendar, FiUser } from 'react-icons/fi'
import { getPrismicClient } from '../services/prismic';
import { format, parseISO } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useState } from 'react';
import Link from 'next/link';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const { next_page, results } = postsPagination;

  const [posts, setPosts] = useState<Post[]>(results)
  const [nextPage, setNextPage] = useState<string>(next_page)

  async function handleNextPageData() {
    if (nextPage) {
      const response = await fetch(nextPage)
      const nextPageFetch = await response.json()
      console.log(nextPageFetch)

      if (nextPage !== '') {
        const nextPagePosts = nextPageFetch.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: format(parseISO(post.first_publication_date), 'd MMM yyyy', { locale: ptBR }),
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
          }
        })

        setPosts([...posts, ...nextPagePosts])
      }

      nextPageFetch.next_page !== null ? setNextPage(nextPageFetch.next_page) : setNextPage('')
    }
  }

  return (
    <>
      <main className={styles.homeContainer}>
        <div className={styles.homeContent}>
          {posts.map((post: Post) => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>
                <div>
                  <time>
                    <FiCalendar />
                    {post.first_publication_date}
                  </time>
                  <span>
                    <FiUser />
                    {post.data.author}
                  </span>
                </div>
              </a>
            </Link>
          ))}

          {!!nextPage && (
            <button type="button" onClick={handleNextPageData}>
              Carregar mais posts
            </button>
          )}
        </div>


      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.content', 'posts.author'],
    pageSize: 1,
  })

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(parseISO(post.first_publication_date), 'd MMM yyyy', { locale: ptBR }),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    }
  })

  const postsPagination = {
    results: posts,
    next_page: String(postsResponse.next_page)
  }

  return {
    props: {
      postsPagination
    },
    revalidate: 60 * 60 * 24,
  }
}