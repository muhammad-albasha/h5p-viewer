interface HeroSectionProps {
  title: string;
  subtitle: string;
  description: string;
  coverImage?: string;
}

export default function HeroSection({ 
  title, 
  subtitle, 
  description, 
  coverImage 
}: HeroSectionProps) {
  return (
    <section className="relative bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 py-16 px-4 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="banner-decoration">
          <div className="banner-decoration-circle banner-circle-1"></div>
          <div className="banner-decoration-circle banner-circle-2"></div>
          <div className="banner-decoration-circle banner-circle-3"></div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content Side */}
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

          {/* Cover Image Side */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {coverImage ? (
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src={coverImage} 
                    alt="H5P Interactive Learning"
                    className="w-full h-auto max-w-md lg:max-w-lg rounded-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-2xl"></div>
                </div>
              ) : (
                // Fallback illustration
                <div className="relative bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-12 max-w-md lg:max-w-lg">
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
          </div>
        </div>
      </div>
    </section>
  );
}
