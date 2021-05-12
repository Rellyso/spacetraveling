import ptBR from 'date-fns/locale/pt-BR'
import { GetStaticPaths, GetStaticProps } from 'next';
import { format, parseISO } from 'date-fns'
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post() {
  return (
    <>
      <main className={styles.postContainer}>
        <article className={styles.post}>
          <div
            className={styles.postImage}
            style={{ backgroundImage: 'url(https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F963ff31f-5679-4a7d-a81c-e5de7f7b10e7%2FUntitled.png?table=block&id=9bc47e5c-4bf6-49f4-b79d-7d129bc48da9&width=1780&userId=a09f7fa9-7b49-4853-a309-46454ab9a756&cache=v2)' }}
          />
          <header>
            <h1>Criando um APP CRA do zero.</h1>
            <div>
              <time>
                <FiCalendar />
                15 mar 2021
              </time>
              <span>
                <FiUser />
                Joseph Oliveira
              </span>
              <span>
                <FiClock />
                4 min
              </span>
            </div>
          </header>

          <div
            className={styles.postContent}
          // dangerouslySetInnerHTML={{ __html: post.data.content.body.text }}
          />

        </article>


      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {

  const prismic = getPrismicClient();

  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author', 'posts.content'],
    }
  );

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  paths.splice(0, 1)

  return {
    paths,
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', String(slug), {});

  const content = response.data.group.map(content => {
    return {
      heading: content.heading,
      body: RichText.asHtml(content.body),
    }
  })

  const post = {
    uid: response.uid,
    first_publication_date: format(parseISO(response.first_publication_date), 'd MMM yyyy', { locale: ptBR }),
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: [...content]
    },
  }

  console.log(JSON.stringify(post, undefined, 4));

  return {
    props: response ? {
      post
    } : {},
    revalidate: 1, // 60 minutos
  }
};
