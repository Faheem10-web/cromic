import React from 'react'
import Hero from '../components/Home/Hero'
import ProductCatalog from '../components/Home/ProductCatalog'
import CategoryShowcase from '../components/Home/CategoryShowcase'
import CampaignSection from '../components/Home/CampaignSection'
import Lookbook from '../components/Home/Lookbook'




function Home() {
  return (
    <>
      <Hero />
   
      <ProductCatalog/>
      <CategoryShowcase/>
   
   <CampaignSection/>
   <Lookbook/>

    </>

  )
}

export default Home