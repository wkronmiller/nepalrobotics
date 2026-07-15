import fs from 'fs'

const data = JSON.parse(fs.readFileSync('src/data/site-data.json', 'utf8'))
const meta = JSON.parse(fs.readFileSync('/tmp/link-meta.json', 'utf8'))
const originalContent = data.pages['/related-links'].blocks[0].content

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#38;/g, '&')
    .replace(/\u00a0/g, ' ')
    .replace(/&hellip;/g, '…')
}

function cleanDescription(text) {
  return decodeHtmlEntities(text)
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.])/g, '$1')
    .trim()
}

function truncate(text, max = 180) {
  if (!text || text.length <= max) return text
  const cut = text.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return `${cut.slice(0, lastSpace > 80 ? lastSpace : max).trim()}…`
}

// Parse inline annotations from the archived page content.
const annotationByUrl = new Map()
const urlPattern = /(https?:\/\/[^\s)]+)(?:\s*\(([^)]+)\))?/g
let match
while ((match = urlPattern.exec(originalContent)) !== null) {
  const url = decodeHtmlEntities(match[1].replace(/[.,;]+$/, ''))
  const note = match[2]?.trim()
  if (note) {
    const existing = annotationByUrl.get(url)
    annotationByUrl.set(url, existing ? `${existing} ${note}` : note)
  }
}

const manualDescriptions = {
  'https://mydeardrone.com/': 'Drone reviews and buying guides for hobbyists and professionals.',
  'http://mydroneauthority.com/reviews/best-drones-with-cameras-buying-guide/': 'Buying guide for camera-equipped drones.',
  'https://diyhacking.com/': 'DIY electronics and maker projects, including robotics and drones.',
  'http://www.thedroneworx.co.uk/blog/buy-build-first-drone/': 'Step-by-step guide to buying or building your first drone.',
  'http://www.himalayanrescue.org': 'Himalayan Rescue Association Nepal, supporting mountain rescue operations.',
  'http://www.kanjisl.edu.np': 'Kanjirowa National Higher Secondary School in Kathmandu.',
  'http://www.spaceref.com/news/viewpr.html?pid=28096': 'SpaceRef press release related to the Nepal Robotics Project.',
  'http://www.bullis.org/': 'Bullis School, a partner institution in Maryland supporting the project.',
  'http://www.bullis.org/student-life/global-studies/index.aspx': 'Bullis School global studies program.',
  'http://www.bullis.org/student-life/clubs-and-academic-teams/index.aspx': 'Bullis School clubs and academic teams, including robotics.',
  'http://www.state.gov/r/pa/ei/bgn/5283.htm': 'U.S. State Department background notes on Nepal.',
  'http://www.state.gov/p/sca/ci/np/': 'U.S. State Department country information for Nepal.',
  'https://www.cia.gov/library/publications/the-world-factbook/geos/np.html': 'CIA World Factbook entry on Nepal.',
  'http://lcweb2.loc.gov/frd/cs/nptoc.html': 'Library of Congress detailed country study of Nepal.',
  'http://nepal.adventure-samsara.com': 'Adventure travel and trekking resources for Nepal.',
  'http://www.ncit.edu.np/': 'Nepal College of Information Technology—winner of the RAN First Prize, October 2013.',
  'http://kronmiller.net/Photos/2011/Asia/Nepal': 'Photo gallery from the 2011 Nepal trip.',
  'http://www.robotshop.com/en/robot-parts.html': 'Robot parts, kits, and components for DIY robotics.',
  'http://www.robotmarketplace.com/store.html': 'Online store for robot kits, parts, and accessories.',
  'http://www.jsc.nasa.gov/Bios/htmlbios/readdy.html': 'NASA biography of astronaut William F. Readdy.',
  'http://www.meicompany.com/default.aspx': 'MEI Company, supplier of drone and robotics components.',
  'http://www.modelaircraft.org/files/105.PDF': 'Academy of Model Aeronautics document on model aircraft operations.',
  'http://www.faa.gov/documentLibrary/media/Advisory_Circular/91-57.pdf': 'FAA Advisory Circular 91-57 on model aircraft operating standards.',
  'http://www.faa.gov/uas/publications/model_aircraft_operators/': 'FAA guidance for model aircraft operators.',
  'http://www.faa.gov/uas/legislative_programs/section_333/': 'FAA Section 333 exemption program for commercial UAS operations.',
  'http://www.faa.gov/news/press_releases/news_story.cfm?newsId=16474': 'FAA press release on unmanned aircraft systems.',
  'http://www.faa.gov/uas/publications/media/model_aircraft_spec_rule.pdf': 'FAA special rule for model aircraft.',
  'https://www.faa.gov/regulations_policies/reauthorization/media/PLAW-112publ95[1].pdf': 'FAA Modernization and Reform Act of 2012 (Public Law 112-95).',
  'http://en.wikipedia.org/wiki/Avalanche_rescue#Search_and_rescue_equipment': 'Wikipedia overview of avalanche rescue equipment and techniques.',
  'http://en.wikipedia.org/wiki/Avalanche_transceiver': 'Wikipedia article on avalanche transceivers used in mountain rescue.',
  'http://en.wikipedia.org/wiki/Distress_radiobeacon': 'Wikipedia article on emergency locator beacons for search and rescue.',
  'http://www.robotshop.com/blog/en/make-uav-lesson-1-platform-rtf-arf-kit-custom-13989': 'RobotShop tutorial on choosing a UAV platform: RTF, ARF, or custom build.',
  'http://www.slf.ch/forschung_entwicklung/lawinen/index_EN': 'Swiss Institute for Snow and Avalanche Research avalanche research division.',
  'http://www.slf.ch/forschung_entwicklung/lawinen/fliessverhalten/index_EN': 'SLF research on avalanche flow behavior and dynamics.',
  'http://www.cv-foundation.org/openaccess/content_cvpr_workshops_2014/W17/papers/Brockers_Towards_Autonomous_Navigation_2014_CVPR_paper.pdf': 'Research paper on autonomous navigation for small unmanned aerial systems.',
  'http://aerialtronics.com/2014/08/aerialtronics-revolutionarily-improves-safety/': 'Aerialtronics article on improving drone safety systems.',
  'http://www.battelle.org/about-us': 'Battelle, a research organization working on unmanned systems technology.',
  'http://www.faa.gov/uas/regulations_policies/media/FAA_UAS-PO_LEA_Guidance.pdf': 'FAA guidance for law enforcement agencies on UAS operations.',
  'https://bay173.mail.live.com/?tid=cmp4F9-dKd5BGzYAAjfeRhjg2&fid=flinbox': 'Archived reference to a commercial DJI Phantom flight at Everest Base Camp.',
  'http://conservationdrones.org/': 'Conservation Drones, using UAVs for wildlife monitoring and environmental protection.',
  'http://www.sardogsnepal.asia/': 'Search and rescue dog teams operating in Nepal.',
  'http://www.nepalarmy.mil.np/bpd.php?pg=dismgmt': 'Nepalese Army disaster management and search-and-rescue operations.',
  'http://diydrones.com/m/blogpost?id=705844%3ABlogPost%3A1776388': 'DIY Drones blog post on the 3DR and Intel partnership.',
  'http://dev.ardupilot.com/wiki/edison-for-drones/': 'ArduPilot wiki on using Intel Edison for drone autopilots.',
  'http://www.acethehimalaya.com/activities/more-activities/rescue-a-evacuation-services.html': 'Ace the Himalaya rescue and evacuation services for trekkers.',
  'http://news.investors.com/ibd-editorials-perspective/022415-740680-drone-found-at-white-house-starts-regulation-debate.htm?p=2': 'Editorial on drone regulation after a UAV was found on the White House lawn.',
  'http://www.fishtailair.com/contact.php': 'Fishtail Air, a helicopter operator serving remote areas of Nepal.',
  'http://jsbsim.sourceforge.net/': 'JSBSim open-source flight dynamics model for aircraft and UAV simulation.',
  'https://www.youtube.com/watch?v=MYYlCO43Log': '1953 documentary on the first ascent of Annapurna.',
  'https://www.youtube.com/watch?v=TImuKQT6vs4': "Video of Nepal's tallest suspension bridge in Kushma (344 m long, 135 m high).",
  'https://www.google.com/search?q=bridges+in+nepal&sa=X&rlz=1C1CHXU_enUS589US589&espv=2&biw=1536&bih=860&tbm=isch&tbo=u&source=univ&ei=lV2DVLqgFfSMsQS_iYHwCg&ved=0CB8QsAQ': 'Image search showing suspension and rope bridges used in rural Nepal.',
  'https://www.google.com/search?q=bridges+in+nepal&espv=210&es_sm=93&tbm=isch&tbo=u&source=univ&sa=X&ei=WK_2UtiMH8SX0QG4jIH4Cg&ved=0CCcQsAQ&biw=1920&bih=1082': 'Image search showing suspension and rope bridges used in rural Nepal.',
  'http://ran.org.np/': 'Robotics Association of Nepal, a national nonprofit promoting robotics education and innovation.',
  'https://www.youtube.com/watch?v=pXZt1DDqVoU': 'Conservation Drones aerial footage from Nepal.',
  'http://www.bbc.com/news/science-environment-18527119': "BBC report on drones protecting Nepal's endangered species from poachers.",
  'https://www.youtube.com/watch?v=moBJMGNSql4': 'GoPro footage of climbers crossing the Khumbu Icefall on Mount Everest.',
  'http://www.evk2cnr.org/WebCams/PyramidOne/everest-webcam.html': 'Live Everest webcam from the Pyramid Observatory (Ev-K2-CNR).',
  'http://www.robowarner.com/robot/rdfbotarduino': 'DIY radio direction-finding homing robot project.',
  'http://www.google.com/maps/about/behind-the-scenes/streetview/treks/khumbu/#town/lukla': 'Google Street View trek through the Khumbu region, from Lukla toward Everest Base Camp.',
  'http://www.nepalmountainnews.com/cms/2015/03/25/nepali-finnish-go-missing-at-mt-annapurna-2/': 'News report on Nepali and Finnish climbers missing on Annapurna II, March 2015.',
  'http://www.nepalmountainnews.com/cms/2015/03/25/finnish-climber-local-guide-die-on-mount-annapurna-in-nepal/': 'News report on a Finnish climber and local guide who died on Annapurna, March 2015.',
}

const enhancedAnnotations = {
  'helo from Lukla to Everest Base Camp and Beyond': 'Helicopter flight from Kathmandu through Lukla to Everest Base Camp and beyond.',
  'Helo rescue at Base Camp': 'Helicopter rescue operation at Everest Base Camp.',
  'Helo landing and takeoff at Base Camp': 'Helicopter landing and takeoff at Everest Base Camp.',
  '2009 avalanche and rescue at Base Camp': 'Footage of a deadly avalanche and rescue at Everest Base Camp, 2009.',
  '2014 avalanche and rescue at Everest': 'Eyewitness film of the April 2014 Everest avalanche that killed 16 Sherpas.',
  'aerial cables, bridges–2014': 'BBC photo essay on high-wire bridges and aerial crossings used by villagers in Nepal.',
  'avalanche victim locating technology': 'RECCO reflector technology used to locate avalanche victims.',
  '2014 Annapurna Circuit blizzard': 'BBC coverage of rescue efforts after a deadly blizzard on the Annapurna Circuit, October 2014.',
  'homing robot': 'DIY radio direction-finding homing robot project.',
  'weather': 'Live Everest webcam from the Pyramid Observatory (Ev-K2-CNR).',
  '2104 professional video at EBC, Khumbu Icefall, Kathmandu': 'Professional drone footage from Everest Base Camp, the Khumbu Icefall, and Kathmandu.',
  'Annapurna 1970 South Face Expedition': 'Documentary on the 1970 Annapurna South Face expedition led by Chris Bonington.',
  'BBC Video–Remembrance of Everest Dead': 'BBC ceremony at Everest Base Camp honoring Sherpas killed in the 2014 avalanche.',
  'Avalanche at Annapurna': 'Footage of a major avalanche on Annapurna.',
  'Conquest of Annapurna, 1953 Release': '1953 documentary on the first ascent of Annapurna.',
  'BBC, April 20, 2015, Safety of Sherpas at Everest': 'BBC report on whether it is safe for Sherpas to return to Everest after the 2014 disaster.',
  'report on 2014 avalanche disaster response in Nepal': 'ICAR report on avalanche disaster response following the 2014 Everest tragedy.',
  'rescue service': 'Ace the Himalaya rescue and evacuation services for trekkers.',
  'planning drones for mapping climbing routes on Everest': 'Adventure Consultants, exploring drones for mapping Everest climbing routes.',
  '3DR partnership with Intel': 'DIY Drones blog post on the 3DR and Intel partnership for drone technology.',
  'Lukla to Base Camp/Icefall–begins at 5:27. Ends 24.00.': 'Documentary trek from Lukla to Everest Base Camp and the Khumbu Icefall.',
}

const metaByUrl = new Map(meta.map((entry) => [entry.url, entry]))

function descriptionFor(url) {
  const cleanUrl = decodeHtmlEntities(url)
  if (manualDescriptions[cleanUrl]) return manualDescriptions[cleanUrl]
  if (annotationByUrl.has(cleanUrl)) {
    const note = annotationByUrl.get(cleanUrl)
    return enhancedAnnotations[note] || note
  }

  const fetched = metaByUrl.get(cleanUrl)
  if (fetched?.description) return truncate(cleanDescription(fetched.description))
  if (fetched?.title && fetched.title !== '(no title)' && fetched.title !== 'Google Search' && fetched.title !== 'Home' && fetched.title !== 'Sign In' && fetched.title !== 'Outlook') {
    return truncate(cleanDescription(fetched.title))
  }

  return ''
}

const externalLinks = data.external_links.map((entry) => {
  const url = typeof entry === 'string' ? entry : entry.url
  const cleanUrl = decodeHtmlEntities(url)
  const description = descriptionFor(url)
  return description ? { url: cleanUrl, description } : { url: cleanUrl }
})

fs.writeFileSync('/tmp/external-links.json', JSON.stringify(externalLinks, null, 2))

const missing = externalLinks.filter((link) => !link.description)
console.error(`Built ${externalLinks.length} links, ${missing.length} without descriptions`)
if (missing.length) {
  console.error('Missing descriptions:')
  missing.forEach((link) => console.error(link.url))
}