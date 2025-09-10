import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Card from './Card';
import api from '../api';
import socket from '../socket';

const AddCardForm = ({ columnId, cardInput, setCardInput }) => {
  const boardId = localStorage.getItem("boardId"); // Or pass as prop
  const userId = localStorage.getItem("userId") || "user";

  const handleChange = (e) => {
    setCardInput(e.target.value);
    socket.emit("typing", boardId, userId);
  };

  const handleBlur = () => {
    socket.emit("stopTyping", boardId, userId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cardInput.trim()) return;
    try {
      await api.post('/cards', { title: cardInput, columnId });
      setCardInput(''); // Clear input
      socket.emit("stopTyping", boardId, userId);
    } catch (error) {
      console.error('Failed to create card', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-auto pt-3 flex flex-col gap-2">
      <input
        type="text"
        value={cardInput}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Enter card title..."
        className="w-full px-3 py-2 mb-2 border-2 border-blue-200 rounded-lg bg-blue-50 focus:border-blue-500 focus:outline-none transition-colors shadow-sm"
        style={{ pointerEvents: 'auto' }}
      />
      <button 
        type="submit"
        className="w-full px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
      >
        Add Card
      </button>
    </form>
  );
};

function Column({ column, cardInput, setCardInput }) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
  } = useSortable({ id: column.id });

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="bg-white/80 rounded-2xl p-6 flex flex-col min-h-80 shadow-xl hover:shadow-2xl transition-all duration-200 border-2 border-blue-200 hover:border-blue-400 hover:-translate-y-1 hover:scale-105 backdrop-blur-md">
      <h3 className="text-xl font-bold mb-6 px-2 text-blue-900 tracking-wide drop-shadow">{column.title}</h3>
      <div className="flex-1">
        <SortableContext
          items={column.cards?.map(card => card.id) || []}
          strategy={verticalListSortingStrategy}
        >
          {column.cards?.map(card => (
            <Card key={card.id} card={card} />
          ))}
        </SortableContext>
      </div>
      <div className="mt-4">
        <AddCardForm columnId={column.id} cardInput={cardInput} setCardInput={setCardInput} />
      </div>
    </div>
  );
}

export default Column;