import { useEffect, useState } from 'react';
import ptBR from 'date-fns/locale/pt-BR'
import { GetStaticPaths, GetStaticProps } from 'next';
import { format, parseISO } from 'date-fns'
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Head from "next/head"
import { useRouter } from 'next/router'
import BounceLoader from "react-spinners/BounceLoader";

import { RichText, } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client'

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';

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

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className={commonStyles.loading}>
        <BounceLoader color="#FF57B2" loading={router.isFallback} size={60} />
        Carregando...
      </div>
    )
  }

  const totalWords = post.data.content.reduce((total, contentItem) => {
    total += contentItem.heading.split(" ").length

    const words = contentItem.body.map(item => item.text.split(" ").length)
    words.map((word) => total += word)

    return total;
  }, 0);

  const readingTime = Math.ceil(totalWords / 200);


  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>

      <Header />

      <div className={`${styles.postContainer} ${commonStyles.commom}`}>

        <div
          className={styles.postImage}
          style={{ backgroundImage: `url(${post.data.banner.url})` }}
        />

        <article className={styles.post}>
          <header>
            <h1>{post.data.title}</h1>
            <div>
              <time>
                <FiCalendar />
                {post.first_publication_date}
              </time>
              <span>
                <FiUser />
                {post.data.author}
              </span>
              <span>
                <FiClock />
                {readingTime} min
                </span>
            </div>
          </header>


          {post.data.content.map(content => (

            <div key={content.heading} className={styles.postContent} >
              <h2>{content.heading}</h2>

              <div dangerouslySetInnerHTML={{ __html: content.body }} />
            </div>
          ))}
        </div>
      </article>
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

  const contentAsText = response.data.group.map(content => {
    return {
      heading: content.heading,
      body: RichText.asText(content.body),
    }
  })


  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: [...content],
      contentAsText: [...contentAsText]
    },
  }

  // console.log(JSON.stringify(post, undefined, 4));

  return {
    props: response ? {
      post
    } : {},
    revalidate: 1, // 60 minutos
  }
};
