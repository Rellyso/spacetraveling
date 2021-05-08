// import { GetStaticProps } from 'next';

// import { getPrismicClient } from '../services/prismic';

import Prismic from '@prismicio/client'
import { GetStaticProps } from 'next';
import { FiCalendar, FiUser } from 'react-icons/fi'
import { getPrismicClient } from '../services/prismic';

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

export default function Home() {
  return (
    <>
      <main className={styles.homeContainer}>
        <div className={styles.homeContent}>
          <a>
            <h1>Como Utilizar Hooks</h1>
            <p>Pensando em sincronização em vez de ciclos de vida.</p>
            <div>
              <time>
                <FiCalendar />
              15 Mar 2021
            </time>
              <span>
                <FiUser />
              Joseph Oliveira
            </span>
            </div>
          </a>

          <a>
            <h1>Como Utilizar Hooks</h1>
            <p>Pensando em sincronização em vez de ciclos de vida.</p>
            <div>
              <time>
                <FiCalendar />
              15 Mar 2021
            </time>
              <span>
                <FiUser />
              Joseph Oliveira
            </span>
            </div>
          </a>

          <button type="button">
            Carregar mais posts
          </button>
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
      slug: post.uid,
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
      first_publication_date: format(parseISO(post.first_publication_date), 'd MMM yyyy', { locale: ptBR })
    }
  })

  console.log(JSON.stringify(postsResponse, null, 2))

  return {
    props: {
      postsResponse
    }
  }
}