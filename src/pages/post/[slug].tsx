import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

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
  // TODO
}

export const getStaticPaths: GetStaticPaths = async () => {

  const prismic = getPrismicClient();
  // const posts = await prismic.query(TODO);

  return {
    paths: [
      { params: { slug: 'como-utilizar-hooks' } }
    ],
    fallback: 'blocking'
  }
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const content = response.data.group.map(content => {
    return {
      heading: content.heading,
      body: content.body.map(body => body.text)
    }
  })

  const post = {
    uid: response.uid,
    first_publication_date: format(parseISO(response.first_publication_date), 'd MMM yyyy', { locale: ptBR }),
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      body: [...content]
    },
  }

  console.log(JSON.stringify(post, undefined, 4));

  return {
    props: {
      // post
    },
    revalidate: 60 * 60, // 60 minutos
  }
};
