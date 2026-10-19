'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Quote, Star } from 'lucide-react';
import { Testimonial } from '@/types';

export const TestimonialsSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials');
        if (!response.ok) throw new Error('Erreur lors du chargement des témoignages.');
        const data: { testimonials: Testimonial[] } = await response.json();
        setTestimonials(data.testimonials);
      } catch (error: unknown) {
        console.error('Erreur chargement des témoignages :', error);
      }
    };

    fetchTestimonials();
  }, []);

  return (
    <section className="bg-[#fbf9f5] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
    <div className="mx-auto max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center"
      >
        <h2 className="text-3xl font-black text-stone-950 sm:text-4xl">
          Ils digitalisent déjà avec QResto
        </h2>
        <p className="mt-2 text-sm text-stone-500 sm:text-base">
          Les retours d’expérience de notre communauté au Bénin.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {testimonials.map((testimonial, index) => (
          <motion.article
            key={testimonial.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="flex flex-col rounded-2xl border border-stone-200 bg-white p-5"
          >
            <Quote className="mb-3 h-5 w-5 text-amber-400" aria-hidden="true" />
            <p className="flex-1 text-sm leading-relaxed text-stone-700">
              “{testimonial.text}”
            </p>
            <div className="mt-4 flex items-center gap-1" aria-label={`${testimonial.rating} étoiles sur 5`}>
              {Array.from({ length: 5 }, (_, star) => (
                <Star key={star} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3 border-t border-stone-100 pt-4">
              {testimonial.avatar ? (
                <img
                  src={testimonial.avatar}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-stone-100" aria-hidden="true" />
              )}
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-stone-900">{testimonial.name}</p>
                <p className="truncate text-[11px] text-stone-500">
                  {testimonial.restaurantName || testimonial.role}, {testimonial.city}
                </p>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
    </section>
  );
};
