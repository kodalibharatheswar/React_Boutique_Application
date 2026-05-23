import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: '/images/licensed-image.png',
      title: 'Long Frocks',
      description: 'Breezy long frocks crafted with premium fabrics — perfect for every occasion.',
      category: 'Long Frocks'
    },
    {
      image: '/images/licensed-image1.jpg',
      title: 'Ready To Wear',
      description: 'Classic ready-to-wear pieces updated with modern cuts.',
      category: 'Ready To Wear'
    },
    {
      image: '/images/licensed-image2.jpg',
      title: 'Kidswear',
      description: 'Comfortable, colorful and adorable styles for the little ones.',
      category: 'Kids wear'
    },
    {
      image: '/images/licensed-image3.png',
      title: 'Lehengas',
      description: 'Handpicked lehengas for weddings and festive celebrations.',
      category: 'Lehengas'
    },
    {
      image: '/images/licensed-image4.jpg',
      title: 'Handlooms',
      description: 'Authentic handloom pieces woven by skilled artisans.',
      category: 'Handlooms'
    }
  ];

  // Auto slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <section className="hero-banner" aria-label="Hero">
      <div className="slides">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`slide ${index === currentSlide ? 'active' : ''}`}
            data-index={index}
          >
            <img src={slide.image} alt={slide.title} />
            <div className="slide-overlay"></div>
            <div className="slide-content">
              <h1>{slide.title}</h1>
              <p className="lead">{slide.description}</p>
              <Link className="btn btn-cta" to={`/products?category=${slide.category}`}>
                SHOP NOW
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Arrows */}
      <button className="hero-arrow left" onClick={prevSlide} aria-label="Previous slide">
        &#10094;
      </button>
      <button className="hero-arrow right" onClick={nextSlide} aria-label="Next slide">
        &#10095;
      </button>

      {/* Dots */}
      <div className="slider-dots" role="tablist">
        {slides.map((_, index) => (
          <button
            key={index}
            className={index === currentSlide ? 'active' : ''}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;