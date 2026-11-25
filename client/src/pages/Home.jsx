import { useMemo } from 'react'
import PageHero from '../components/PageHero'
import { HeadlineTab, HeroSlider, QuickLinks } from '../components/home/HomeTop'
import { Events, FoodArticles, FoodBrands, Happening, News } from '../components/home/HomeFeeds'
import { Awards, GettingHere, SocialFeed } from '../components/home/HomeBottom'
import { HOME } from '../data/homeData'
import { useI18n } from '../i18n'

/**
 * หน้าแรก (/home) – the page the menu's "หน้าแรก" and the logo open.
 * ("/" stays the start page that opens first.)
 *
 * Top to bottom: banner image with the Headline tab card (panel hidden until clicked) · Hero slider · Quick links ·
 * Happening · Food articles · Food brands · All events · News · Awards · Social · Map (getting here).
 * Content: src/data/homeData.js
 */
export default function Home({ settings }) {
  const { tr } = useI18n()
  const data = useMemo(() => tr(HOME), [tr])

  return (
    <>
      {/* banner image, then the white card with the headline tabs right below it (not over the image) */}
      <PageHero settings={settings} overlap={false}>
        <HeadlineTab tabs={data.headline.tabs} />
      </PageHero>

      <section className="container-bm pt-10">
        <HeroSlider slides={data.slides} />
        <QuickLinks items={data.quickLinks} />
      </section>

      <Happening items={data.happening} />
      <FoodArticles items={data.foodArticles} />
      <FoodBrands items={data.foodBrands} />
      <Events items={data.events} />
      <News items={data.news} />
      <Awards items={data.awards} />
      <SocialFeed links={data.social.links} posts={data.social.posts} page={settings.site_name} />
      <GettingHere settings={settings} info={data.gettingHere} />
    </>
  )
}
