import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function Card({ card }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-gradient-to-br from-blue-50/80 to-white/90 rounded-xl shadow-lg p-4 mb-4 cursor-grab border-2 border-blue-100 hover:border-blue-400 hover:shadow-2xl transition-all duration-200 hover:scale-105 font-semibold text-blue-900 backdrop-blur-md"
    >
      {card.title}
    </div>
  );
}

export default Card;