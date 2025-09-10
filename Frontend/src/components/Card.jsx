import React, { useState, useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../api';

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

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isEditing) {
      setTitle(card.title);
    }
  }, [card.title, isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleChange = (e) => {
    setTitle(e.target.value);
  };

  const saveTitle = async () => {
    if (title.trim() === '') {
      setTitle(card.title);
      setIsEditing(false);
      return;
    }
    if (title !== card.title) {
      try {
        await api.put(`/cards/${card.id}`, { title });
      } catch (error) {
        console.error('Failed to update card title', error);
        setTitle(card.title);
      }
    }
    setIsEditing(false);
  };

  const handleBlur = () => {
    saveTitle();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveTitle();
    } else if (e.key === 'Escape') {
      setTitle(card.title);
      setIsEditing(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-gradient-to-br from-blue-50/80 to-white/90 rounded-xl shadow-lg p-4 mb-4 cursor-grab border-2 border-blue-100 hover:border-blue-400 hover:shadow-2xl transition-all duration-200 hover:scale-105 font-semibold text-blue-900 backdrop-blur-md"
      onDoubleClick={() => setIsEditing(true)}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full bg-white rounded-md border border-blue-300 px-2 py-1 text-blue-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      ) : (
        title
      )}
    </div>
  );
}

export default Card;
