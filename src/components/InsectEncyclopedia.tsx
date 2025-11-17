import { useState, useEffect } from 'react'
import { INSECTS } from '../data/insects'
import { Insect } from '../types'
import './InsectEncyclopedia.css'

interface InsectEncyclopediaProps {
  unlockedInsects: string[]
  onClose: () => void
}

export default function InsectEncyclopedia({ unlockedInsects, onClose }: InsectEncyclopediaProps) {
  const [selectedInsect, setSelectedInsect] = useState<Insect | null>(null)
  const [hoveredInsect, setHoveredInsect] = useState<string | null>(null)

  const totalInsects = INSECTS.length
  const unlockedCount = unlockedInsects.length
  const completionPercentage = Math.round((unlockedCount / totalInsects) * 100)

  // Group insects by level
  const insectsByLevel = INSECTS.reduce((acc, insect) => {
    if (!acc[insect.level]) {
      acc[insect.level] = []
    }
    acc[insect.level].push(insect)
    return acc
  }, {} as Record<number, Insect[]>)

  const levelNames = [
    'Brilliant Beetles',
    'Marvelous Ants & Social Insects',
    'Masters of Camouflage',
    'Bioluminescent & Night Insects',
    'Rare & Mysterious Insects'
  ]

  const isUnlocked = (insectId: string) => unlockedInsects.includes(insectId)

  const handleInsectClick = (insect: Insect) => {
    if (isUnlocked(insect.id)) {
      setSelectedInsect(insect)
    }
  }

  const handleCloseDetail = () => {
    setSelectedInsect(null)
  }

  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedInsect) {
          handleCloseDetail()
        } else {
          onClose()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedInsect, onClose])

  return (
    <div className="encyclopedia-overlay">
      <div className="encyclopedia-container">
        {/* Header */}
        <div className="encyclopedia-header">
          <div>
            <h1 className="encyclopedia-title">Insect Encyclopedia</h1>
            <p className="encyclopedia-subtitle">
              Discovered: {unlockedCount} of {totalInsects} insects ({completionPercentage}%)
            </p>
          </div>
          <button className="encyclopedia-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div className="encyclopedia-progress-container">
          <div className="encyclopedia-progress-bar">
            <div
              className="encyclopedia-progress-fill"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="encyclopedia-content">
          {[1, 2, 3, 4, 5].map((level) => (
            <div key={level} className="encyclopedia-level-section">
              <h2 className="encyclopedia-level-title">
                Level {level}: {levelNames[level - 1]}
              </h2>
              <div className="encyclopedia-grid">
                {insectsByLevel[level]?.map((insect) => {
                  const unlocked = isUnlocked(insect.id)
                  return (
                    <div
                      key={insect.id}
                      className={`encyclopedia-card ${unlocked ? 'unlocked' : 'locked'} ${
                        hoveredInsect === insect.id && unlocked ? 'hovered' : ''
                      }`}
                      onClick={() => handleInsectClick(insect)}
                      onMouseEnter={() => unlocked && setHoveredInsect(insect.id)}
                      onMouseLeave={() => setHoveredInsect(null)}
                    >
                      {unlocked ? (
                        <>
                          <div
                            className="encyclopedia-card-image"
                            style={{ backgroundColor: insect.color }}
                          >
                            <span className="encyclopedia-card-placeholder">
                              {insect.commonName[0]}
                            </span>
                          </div>
                          <div className="encyclopedia-card-info">
                            <h3 className="encyclopedia-card-name">{insect.commonName}</h3>
                            <p className="encyclopedia-card-scientific">
                              {insect.scientificName}
                            </p>
                            <div className="encyclopedia-card-badges">
                              <span className={`encyclopedia-badge rarity-${insect.rarity.replace(' ', '-')}`}>
                                {insect.rarity}
                              </span>
                              <span className="encyclopedia-badge size">{insect.size}</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="encyclopedia-card-image locked">
                            <span className="encyclopedia-lock-icon">🔒</span>
                          </div>
                          <div className="encyclopedia-card-info">
                            <h3 className="encyclopedia-card-name">???</h3>
                            <p className="encyclopedia-card-scientific">Not yet discovered</p>
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedInsect && (
        <div className="encyclopedia-modal-overlay" onClick={handleCloseDetail}>
          <div className="encyclopedia-modal" onClick={(e) => e.stopPropagation()}>
            <button className="encyclopedia-modal-close" onClick={handleCloseDetail}>
              ✕
            </button>

            <div className="encyclopedia-modal-header">
              <div
                className="encyclopedia-modal-image"
                style={{ backgroundColor: selectedInsect.color }}
              >
                <span className="encyclopedia-modal-placeholder">
                  {selectedInsect.commonName[0]}
                </span>
              </div>
              <div className="encyclopedia-modal-title-section">
                <h2 className="encyclopedia-modal-title">{selectedInsect.commonName}</h2>
                <p className="encyclopedia-modal-scientific">
                  {selectedInsect.scientificName}
                </p>
                <div className="encyclopedia-modal-badges">
                  <span className={`encyclopedia-badge rarity-${selectedInsect.rarity.replace(' ', '-')}`}>
                    {selectedInsect.rarity}
                  </span>
                  <span className="encyclopedia-badge size">{selectedInsect.size}</span>
                  <span className="encyclopedia-badge habitat">{selectedInsect.habitat}</span>
                  <span className="encyclopedia-badge diet">Diet: {selectedInsect.diet}</span>
                </div>
              </div>
            </div>

            <div className="encyclopedia-modal-content">
              <section className="encyclopedia-modal-section">
                <h3 className="encyclopedia-modal-section-title">About This Insect</h3>
                {selectedInsect.facts.map((fact, index) => (
                  <p key={index} className="encyclopedia-modal-fact">
                    {fact}
                  </p>
                ))}
              </section>

              <section className="encyclopedia-modal-section encyclopedia-trivia">
                <h3 className="encyclopedia-modal-section-title">💡 Did You Know?</h3>
                <div className="encyclopedia-trivia-box">
                  <p className="encyclopedia-trivia-text">
                    {getDidYouKnow(selectedInsect)}
                  </p>
                </div>
              </section>

              <section className="encyclopedia-modal-section">
                <h3 className="encyclopedia-modal-section-title">Quick Facts</h3>
                <div className="encyclopedia-quick-facts">
                  <div className="encyclopedia-fact-item">
                    <span className="encyclopedia-fact-label">Size:</span>
                    <span className="encyclopedia-fact-value">{selectedInsect.size}</span>
                  </div>
                  <div className="encyclopedia-fact-item">
                    <span className="encyclopedia-fact-label">Habitat:</span>
                    <span className="encyclopedia-fact-value">{selectedInsect.habitat}</span>
                  </div>
                  <div className="encyclopedia-fact-item">
                    <span className="encyclopedia-fact-label">Diet:</span>
                    <span className="encyclopedia-fact-value">{selectedInsect.diet}</span>
                  </div>
                  <div className="encyclopedia-fact-item">
                    <span className="encyclopedia-fact-label">Rarity:</span>
                    <span className="encyclopedia-fact-value">{selectedInsect.rarity}</span>
                  </div>
                </div>
              </section>
            </div>

            <div className="encyclopedia-modal-footer">
              <button className="encyclopedia-modal-button" onClick={handleCloseDetail}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to generate "Did You Know?" trivia
function getDidYouKnow(insect: Insect): string {
  const triviaMap: Record<string, string> = {
    'hercules-beetle': 'Hercules beetles can grow longer than a human hand and make excellent pets in some countries, where children race them!',
    'glass-wing-butterfly': 'Scientists are studying the glass-wing butterfly\'s transparent wings to develop better anti-reflective coatings for phone screens and solar panels.',
    'titan-beetle': 'Despite being one of the largest beetles on Earth, nobody has ever seen a titan beetle larva in the wild - it\'s one of entomology\'s great mysteries!',
    'blue-morpho-butterfly': 'Pilots flying over the Amazon rainforest can sometimes spot flashes of blue from blue morpho butterflies flying below the canopy.',
    'rainbow-scarab': 'Ancient Egyptians considered scarab beetles sacred and used them as symbols of rebirth and transformation.',
    'leafcutter-ant': 'The fungus gardens that leafcutter ants grow underground can be as large as a beach ball and feed millions of ants!',
    'bullet-ant': 'The bullet ant\'s venom contains a neurotoxin called poneratoxin that affects nerve endings - it\'s one of nature\'s most powerful insect venoms.',
    'army-ant': 'Army ants are completely blind but communicate perfectly through chemical signals, allowing hundreds of thousands to work as one super-organism.',
    'orchid-bee': 'Male orchid bees don\'t just collect perfumes - they create unique signature scents by mixing fragrances from different flowers!',
    'tarantula-hawk-wasp': 'Despite having one of the most painful stings, tarantula hawks are gentle and rarely sting humans unless directly threatened.',
    'walking-stick': 'Some walking stick species can live for over a year, and certain tropical species grow longer than a ruler - up to 2 feet!',
    'leaf-katydid': 'Leaf katydids are masters of camouflage - even their eggs look like plant seeds to fool predators.',
    'moss-mimic-katydid': 'The moss mimic katydid is so rare that scientists have only discovered a few species, and there are likely more waiting to be found.',
    'bark-mantis': 'Mantises are the only insects that can look over their shoulders - their flexible necks give them nearly 360-degree vision.',
    'thorn-bug': 'Thorn bugs vibrate plant stems to communicate with each other, creating messages that travel through the plant like a telephone line.',
    'railroad-worm': 'The railroad worm is actually not a worm at all - it\'s the larva of a click beetle that never grows up, staying in larval form its entire life.',
    'lantern-fly': 'For centuries, people believed lantern flies could glow in the dark, but this turned out to be a myth - the name stuck anyway!',
    'click-beetle': 'Click beetles can launch themselves 6 inches into the air with their clicking mechanism - that\'s like a human jumping onto a 4-story building!',
    'firefly-beetle': 'Fireflies are the most efficient light producers in the world - nearly 100% of their energy becomes light with almost no heat waste.',
    'luna-moth': 'Luna moths emerge from their cocoons with shriveled wings that they must pump full of fluid - this only takes about 2 hours, and then they fly!',
    'peanut-head-bug': 'The peanut head bug was once thought to be deadly poisonous, but this is completely false - they\'re totally harmless sap-suckers.',
    'assassin-bug': 'Some assassin bug species have been used in traditional medicine for centuries, though scientists are only now studying their potential uses.',
    'goliath-birdeater': 'The goliath birdeater rarely eats birds - its name comes from a Victorian-era illustration of one eating a hummingbird, which is very unusual.',
    'glasswing-butterfly-migrant': 'Glasswing butterflies can see ultraviolet light that humans can\'t detect, helping them navigate and find flowers.',
    'jewel-beetle': 'Some jewel beetle species have been extinct for millions of years, but we can still see their original brilliant colors preserved in fossils!'
  }

  return triviaMap[insect.id] || 'This amazing insect has many more secrets waiting to be discovered by scientists!'
}
