import React from 'react';
import { Link } from 'react-router-dom';

const Categories = () => {
  const categories = [
    {
      name: 'Sarees',
      image: '/images/shopcategory/sarees.png',
      color: '#7B3F00',
      category: 'Sarees'
    },
    {
      name: 'Lehengas',
      image: '/images/shopcategory/lehengas.png',
      color: '#B22222',
      category: 'Lehengas'
    },
    {
      name: 'Kurtis & Suits',
      image: '/images/shopcategory/kurthi&suits.png',
      color: '#800080',
      category: 'Kurtis'
    },
    {
      name: 'Long Frocks',
      image: '/images/shopcategory/longfrock.png',
      color: '#4A90E2',
      category: 'Long Frocks'
    },
    {
      name: 'Ready To Wear',
      image: '/images/shopcategory/readymate.png',
      color: '#D0021B',
      category: 'Ready To Wear'
    },
    {
      name: 'Kids wear',
      image: '/images/shopcategory/kidswear.png',
      color: '#50E3C2',
      category: 'Kids wear'
    },
    {
      name: 'Mom & Me',
      image: '/images/shopcategory/Mom-Me.png',
      color: '#703B3B',
      category: 'Mom & Me'
    },
    {
      name: 'Dupattas',
      image: '/images/shopcategory/Dupatta.png',
      color: '#7ED321',
      category: 'Dupattas'
    },
    {
      name: 'Blouses',
      image: '/images/shopcategory/Blouses.png',
      color: '#9013FE',
      category: 'Blouses'
    }
  ];

  return (
    <section className="py-5">
      <div className="container">
        <h2 className="text-center mb-5 hero-title">Shop By Category</h2>
        <div className="row g-4">
          {categories.map((cat, index) => (
            <div key={index} className="col-sm-6 col-md-4">
              <Link 
                to={`/products?category=${cat.category}`} 
                className="category-card shadow" 
                style={{ backgroundColor: cat.color }}
              >
                <span className="category-text">{cat.name}</span>
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="category-image" 
                />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;