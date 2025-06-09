'use client'
import { useState, useEffect } from 'react'

interface H5PContent {
  id: number
  name: string
  coverImagePath?: string
  slug?: string
}

interface HeroSectionProps {
  title: string
  subtitle: string
  description: string
  coverImage?: string
}

export default function HeroSection({ 
  title, 
  subtitle, 
  description, 
  coverImage 
}: HeroSectionProps) {
  const [coverImages, setCoverImages] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCoverImages = async () => {
      try {
        console.log('Fetching H5P content...')
        const response = await fetch('/api/h5p-content')
        
        if (response.ok) {
          const content: H5PContent[] = await response.json()
          console.log('API Response:', content)
          
          // Extract cover image paths
          const validImages = content
            .filter(item => item.coverImagePath && item.coverImagePath.trim() !== '')
            .map(item => item.coverImagePath!)
          
          console.log('Valid images from API:', validImages)
          if (validImages.length > 0) {
            setCoverImages(validImages)
          } else {
            // Try direct paths from all available content
            const directImages = content
              .filter(item => item.slug)
              .map(item => `/h5p/${item.slug}/content/images/cover.jpg`)
            
            console.log('Direct image paths:', directImages)
            
            if (directImages.length > 0) {
              setCoverImages(directImages)
            }
          }
        } else {
          console.error('API failed:', response.status)
          setCoverImages(['/h5p/test-12d71bd6/content/images/cover.jpg'])
        }
      } catch (error) {
        console.error('Error:', error)
        setCoverImages(['/h5p/test-12d71bd6/content/images/cover.jpg'])
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchCoverImages()
  }, [])

  // Auto-advance slider when multiple images
  useEffect(() => {
    if (coverImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          prevIndex === coverImages.length - 1 ? 0 : prevIndex + 1
        )
      }, 4000)

      return () => clearInterval(interval)
    }
  }, [coverImages.length])

  return (
    <section className="relative bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 py-16 px-4 overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="banner-decoration">
          <div className="banner-decoration-circle banner-circle-1"></div>
          <div className="banner-decoration-circle banner-circle-2"></div>
          <div className="banner-decoration-circle banner-circle-3"></div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-base-content leading-tight">
                {title}
              </h1>
              <p className="text-xl md:text-2xl text-base-content/80 font-medium">
                {subtitle}
              </p>
            </div>
            
            <p className="text-lg text-base-content/70 leading-relaxed max-w-lg">
              {description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a 
                href="/h5p" 
                className="btn btn-primary btn-lg px-8 py-3 text-lg font-semibold"
              >
                Jetzt entdecken
              </a>
              <a 
                href="/setup-help" 
                className="btn btn-outline btn-lg px-8 py-3 text-lg font-semibold"
              >
                Mehr erfahren
              </a>
            </div>
          </div>
          
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md lg:max-w-lg">
              {coverImage ? (
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src={coverImage} 
                    alt="H5P Interactive Learning"
                    className="w-full h-auto rounded-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-2xl"></div>
                </div>
              ) : (
                <div className="relative bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl overflow-hidden shadow-2xl">
                  {!isLoading && coverImages.length > 0 ? (
                    <div className="relative w-full aspect-[4/3] min-h-[320px]">
                      {/* Render all images for slider */}
                      {coverImages.map((imagePath, index) => (
                        <div
                          key={index}
                          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                          }`}
                        >
                          <img
                            src={imagePath}
                            alt={`H5P Cover Image ${index + 1}`}
                            className="w-full h-full object-cover rounded-2xl"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              const originalSrc = target.src
                              console.log('Image failed to load:', originalSrc)
                              
                              // Try fallback paths
                              if (originalSrc.includes('/api/h5p/cover/')) {
                                target.src = originalSrc.replace('/api/h5p/cover/', '/h5p/')
                              } else if (!originalSrc.includes('placeholder')) {
                                target.src = '/assets/placeholder-image.svg'
                              } else {
                                target.style.display = 'none'
                                target.onerror = null
                              }
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-2xl"></div>
                        </div>
                      ))}

                      {/* Navigation dots for multiple images */}
                      {coverImages.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                          {coverImages.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                index === currentImageIndex
                                  ? 'bg-white scale-110 shadow-lg'
                                  : 'bg-white/60 hover:bg-white/80'
                              }`}
                              aria-label={`Zeige Bild ${index + 1} von ${coverImages.length}`}
                            />
                          ))}
                        </div>
                      )}

                      {/* Navigation arrows for multiple images */}
                      {coverImages.length > 1 && (
                        <>
                          <button
                            onClick={() => setCurrentImageIndex(prev => 
                              prev === 0 ? coverImages.length - 1 : prev - 1
                            )}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-200 z-10 backdrop-blur-sm"
                            aria-label="Vorheriges Bild"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setCurrentImageIndex(prev => 
                              prev === coverImages.length - 1 ? 0 : prev + 1
                            )}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-200 z-10 backdrop-blur-sm"
                            aria-label="Nächstes Bild"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center aspect-[4/3] min-h-[320px] p-12">
                      <div className="space-y-6 text-center">
                        <div className="w-24 h-24 mx-auto bg-primary/30 rounded-full flex items-center justify-center">
                          <svg className="w-12 h-12 text-primary" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-base-content">
                          Interaktive Lerninhalte
                        </h3>
                        <p className="text-base-content/70">
                          Entdecke eine Welt voller interaktiver H5P-Elemente
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
