import { useMemo } from 'react'
import PageHero from '../components/PageHero'
import LeasingBanner from '../components/LeasingBanner'
import { HeadlineTab, HeroSlider, QuickLinks } from '../components/home/HomeTop'
import { Events, FoodArticles, FoodBrands, Happening, News } from '../components/home/HomeFeeds'
import { Awards, GettingHere, SocialFeed, useLivePosts } from '../components/home/HomeBottom'
import { HOME } from '../data/homeData'
import { useI18n } from '../i18n'

/**
 * หน้าแรก (/) – the page the site opens on; the menu's "หน้าแรก" and the logo link here.
 * Menu links jump to sections on it: #events, #leasing (ร่วมธุรกิจกับเรา), #visit (Visit Us / map).
 *
 * Top to bottom: banner image with the Headline tab card (panel hidden until clicked) · Hero slider · Happening · Quick links ·
 * Food articles · Food brands · All events · News · Awards · Social · Leasing banner · Map (getting here).
 * Content: src/data/homeData.js
 */
export default function Home({ settings }) {
  const { tr } = useI18n()
  const data = useMemo(() => tr(HOME), [tr])
  // real Facebook / Instagram posts once the server is set up; sample posts until then
  const livePosts = useLivePosts()

  return (
    <>
      {/* banner image, then the white card with the headline tabs right below it (not over the image) */}
      <PageHero settings={settings} overlap={false}>
        <HeadlineTab tabs={data.headline.tabs} />
      </PageHero>

      <section className="container-bm pt-10">
        <HeroSlider slides={data.slides} />
      </section>

      <Happening items={data.happening} />

      {/* quick links (ค้นหาร้านค้า · กิจกรรม · การเดินทาง · เช่าพื้นที่) right under the highlights */}
      <section className="container-bm pt-3">
        <QuickLinks items={data.quickLinks} />
      </section>
      <FoodArticles items={data.foodArticles} />
      <FoodBrands items={data.foodBrands} />
      <Events items={data.events} />
      <News items={data.news} />
      <Awards items={data.awards} />
      <SocialFeed links={data.social.links} posts={livePosts || data.social.posts} page={settings.site_name} />
      <div className="pt-16 lg:pt-20">
        <LeasingBanner settings={settings} />
      </div>
      <GettingHere settings={settings} info={data.gettingHere} />
    </>
  )
}
