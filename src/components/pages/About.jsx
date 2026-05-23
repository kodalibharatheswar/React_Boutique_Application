import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';

const About = () => {
  return (
    <>
      <Navbar />

      {/* About Hero Section */}
      <section className="py-5 text-center about-hero">
        <div className="container">
          <h1 className="hero-title display-4 mb-2">Our Story</h1>
          <p className="lead text-muted">Celebrating Heritage, Crafting Elegance.</p>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-5">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <img 
                src="https://placehold.co/800x600/f8e4c7/444?text=Our+Artisans" 
                alt="Artisan working on fabric" 
                className="img-fluid story-image w-100"
              />
            </div>
            <div className="col-lg-6">
              <h3 className="hero-title mb-4">The Anvi Studio Difference</h3>
              <p>
                Anvi Studio was founded in the heart of Vijayawada with a simple yet profound mission: 
                to blend India's rich textile heritage with contemporary design sensibilities. We believe 
                that ethnic wear should be both timeless and effortless.
              </p>
              <p>
                From the sourcing of premium silks and cottons to the final hand-finished detail, every 
                garment is a testament to quality and meticulous craftsmanship. We work closely with skilled 
                artisans across India, ensuring fair wages and preserving age-old techniques that are at risk 
                of fading away.
              </p>
              <p className="fw-bold mt-4">
                "Elegance is not about being noticed, it's about being remembered." - Anvi Studio Motto
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission and Values Section */}
      <section className="py-5 section-bg">
        <div className="container">
          <h3 className="hero-title text-center mb-5">Our Core Values</h3>
          <div className="row text-center g-4">
            
            {/* Value 1: Ethical Sourcing */}
            <div className="col-md-4">
              <div className="p-4 bg-white rounded shadow-sm h-100">
                <i className="fas fa-hand-holding-usd value-icon"></i>
                <h5>Ethical Sourcing</h5>
                <p className="text-muted small">
                  We commit to fair trade practices, guaranteeing that every artisan involved in 
                  crafting our clothes is justly compensated.
                </p>
              </div>
            </div>

            {/* Value 2: Uncompromising Quality */}
            <div className="col-md-4">
              <div className="p-4 bg-white rounded shadow-sm h-100">
                <i className="fas fa-gem value-icon"></i>
                <h5>Uncompromising Quality</h5>
                <p className="text-muted small">
                  Only premium, handpicked fabrics and enduring designs make it into our collections, 
                  ensuring longevity and luxury.
                </p>
              </div>
            </div>

            {/* Value 3: Sustainable Fashion */}
            <div className="col-md-4">
              <div className="p-4 bg-white rounded shadow-sm h-100">
                <i className="fas fa-leaf value-icon"></i>
                <h5>Sustainable Fashion</h5>
                <p className="text-muted small">
                  We strive to minimize waste and use eco-friendly materials wherever possible in our 
                  production cycle.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Team Callout / Founder Section */}
      <section className="py-5 text-center">
        <div className="container">
          <div className="col-lg-8 mx-auto">
            <h3 className="hero-title mb-3">Meet the Founder</h3>
            <p className="lead text-muted">
              Founded by Pratyusha & Vijaya, Anvi Studio started as a passion project to bring 
              accessible, high-quality traditional attire to the modern woman.
            </p>
            <Link to="/contact" className="btn btn-dark mt-3">
              Get In Touch
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default About;