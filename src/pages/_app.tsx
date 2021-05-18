import { AppProps } from 'next/app';
import { Router } from 'next/router';
import NProgress from 'nprogress'

import '../styles/globals.scss';
import '../styles/nprogress.scss';

Router.events.on('routeChangeStart', (url) => {
  console.log(`Loading: ${url}`)
  NProgress.start()
})
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp;
