import Navbar from './Navbar'
import HeroSection from './HeroSection'
import ProductSection from './ProductSection'
import HowItWorksSection from './HowItWorksSection'
import LearningExperienceSection from './LearningExperienceSection'
import FinalCtaSection from './FinalCtaSection'

export default function LandingPage({
  user,
  onOpenAuth,
  onEnterWorkspace,
  onSelectFeature,
}) {
  return (
    <div className="landing-page-root">
      {/* Navigation */}
      <Navbar
        user={user}
        onOpenAuth={onOpenAuth}
        onGoToWorkspace={onEnterWorkspace}
      />

      {/* Hero Section */}
      <HeroSection
        onStartLearning={() => {
          if (user) onEnterWorkspace()
          else onOpenAuth('signup')
        }}
        onExploreProduct={() => {
          const el = document.getElementById('product')
          if (el) el.scrollIntoView({ behavior: 'smooth' })
        }}
      />

      {/* Product Section */}
      <ProductSection
        onSelectFeature={onSelectFeature}
      />

      {/* How It Works RAG Section */}
      <HowItWorksSection />

      {/* AI Learning Experience Section */}
      <LearningExperienceSection
        onEnterApp={() => {
          if (user) onEnterWorkspace()
          else onOpenAuth('signup')
        }}
      />

      {/* Final Section */}
      <FinalCtaSection
        onEnterApp={() => {
          if (user) onEnterWorkspace()
          else onOpenAuth('signup')
        }}
      />
    </div>
  )
}
