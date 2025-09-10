import React, { useState } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Card from './Card';
import api from '../api';
import socket from '../socket';

const AddCardForm = ({ columnId }) => {
  const [title, setTitle] = useState(''); // State is now local to this component
  // We need boardId and userId for the typing indicator
  const boardId = localStorage.getItem("boardId");
  const userId = localStorage.getItem("userId") || "user";

  const handleChange = (e) => {
    setTitle(e.target.value);
    socket.emit("typing", boardId, userId);
  };

  const handleBlur = () => {
    socket.emit("stopTyping", boardId, userId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await api.post('/cards', { title: title, columnId });
      setTitle(''); // Clear local state
      socket.emit("stopTyping", boardId, userId);
    } catch (error) {
      console.error('Failed to create card', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-auto pt-3 flex flex-col gap-2">
      <input
        type="text"
        value={title}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Enter card title..."
        className="w-full px-3 py-2 mb-2 border-2 border-slate-300 rounded-lg bg-slate-50 focus:border-blue-500 focus:outline-none transition-colors shadow-sm"
        onClick={(e) => e.stopPropagation()} // Prevent drag listeners on the column from firing
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

function Column({ column }) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
  } = useSortable({ id: column.id });

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
      className="bg-gradient-to-br from-blue-100/70 to-white/90 rounded-2xl p-6 w-72 flex-shrink-0 flex flex-col shadow-2xl border-2 border-blue-300 hover:border-blue-500 hover:shadow-3xl transition-all duration-300 backdrop-blur-lg"
    >
      <h3 className="text-xl font-extrabold mb-5 text-blue-900 tracking-wide drop-shadow-lg">{column.title}</h3>
      <div className="flex-1 min-h-[60px]">
        <SortableContext
          items={column.cards?.map(card => card.id) || []}
          strategy={verticalListSortingStrategy}
        >
          {column.cards?.map(card => (
            <Card key={card.id} card={card} />
          ))}
        </SortableContext>
      </div>
      <AddCardForm columnId={column.id} />
    </div>
  );
}

export default Column;