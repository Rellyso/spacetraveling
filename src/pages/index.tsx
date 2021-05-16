import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client'
import { getPrismicClient } from '../services/prismic';

import { FiCalendar, FiUser } from 'react-icons/fi'
import Header from '../components/Header';
import BounceLoader from "react-spinners/BounceLoader";

import { format, parseISO } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

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
  const [isLoading, setIsLoading] = useState<boolean>(false)

  async function handleNextPageData() {
    setIsLoading(true)
    try {
      if (nextPage) {
        const response = await fetch(nextPage)
        const nextPageFetch = await response.json()

        if (nextPage !== '') {
          const nextPagePosts = nextPageFetch.results.map(post => {
            return {
              uid: post.uid,
              first_publication_date: post.first_publication_date,
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
    } catch (err) {
      return
    }
    setIsLoading(false)
  }

  return (
    <>
      <Head>
        <title>Início | spacetraveling</title>
      </Head>

      <Header />

      <main className={`${styles.homeContainer} ${commonStyles.commom}`}>
        <div className={styles.homeContent}>
          {posts.map((post: Post) => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>
                <div>
                  <time>
                    <FiCalendar />
                    {format(parseISO(post.first_publication_date), 'd MMM yyyy', { locale: ptBR })}
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
            <div className={styles.buttonContainer}>
              <button type="button" onClick={handleNextPageData}>
                Carregar mais posts
              </button>
              { isLoading && (
                <BounceLoader color="#FF57B2" loading={isLoading} size={15} />
              )}
            </div>
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
    pageSize: 2,
  })

  const posts = postsResponse.results.map((post): Post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
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