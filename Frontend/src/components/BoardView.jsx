import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { DndContext, closestCorners } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import api from '../api';
import socket from '../socket';
import Column from './Column';

// UI component for the Audit Log
function AuditLog({ boardId }) {
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    api.get(`/boards/${boardId}/audit`)
      .then(res => setLogs(res.data))
      .catch(() => setLogs([]));
  }, [boardId]);
  return (
    <div className="info-section">
      <strong>Audit Log:</strong>
      <ul className="log-list">
        {logs.map((log, idx) => (
          <li key={idx} className="log-item">
            [{new Date(log.createdAt).toLocaleTimeString()}] {log.eventType}: {log.details?.title || log.details?.message || ""}
          </li>
        ))}
      </ul>
    </div>
  );
}

// UI component for Presence and Typing indicators
function PresenceBar({ onlineUsers, typingUsers }) {
  return (
    <div className="presence-bar">
      <strong>Online:</strong> {onlineUsers.length ? onlineUsers.join(", ") : "None"}
      {typingUsers.length > 0 && (
        <span className="typing-indicator">
          Typing: {typingUsers.join(", ")}
        </span>
      )}
    </div>
  );
}

// UI component for Notifications
function NotificationBar({ notifications }) {
    return (
      <div className="notification-container">
        {notifications.map((n, idx) => (
          <div key={idx} className="notification">
            {n.message}
          </div>
        ))}
      </div>
    );
  }

// Form for adding a new column
const AddColumnForm = ({ boardId }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await api.post('/columns', { title, boardId });
      setTitle('');
    } catch (error) {
      console.error('Failed to create column', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-column-form">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter column title..."
        className="input"
      />
      <button type="submit" className="button">
        Add Column
      </button>
    </form>
  );
};

// Main BoardView component
function BoardView() {
  const { boardId } = useParams();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const boardRef = useRef(null);

  // Helper function for deep object comparison to prevent unnecessary re-renders
  function deepEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  useEffect(() => {
    localStorage.setItem("boardId", boardId);
    
    api.get(`/boards/${boardId}`)
      .then(res => {
        setBoard(res.data);
        boardRef.current = res.data;
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch board:", err);
        setLoading(false);
      });

    socket.connect();
    const userId = localStorage.getItem("userId") || "user";
    socket.emit('joinBoard', boardId, userId);

    socket.on('boardUpdated', (newBoard) => {
      if (!deepEqual(boardRef.current, newBoard)) {
        setBoard(newBoard);
        boardRef.current = newBoard;
      }
    });
    socket.on('presenceUpdate', setOnlineUsers);
    socket.on('typingUpdate', setTypingUsers);
    socket.on('notification', (notif) => {
      setNotifications((prev) => [notif, ...prev].slice(0, 5));
    });

    return () => {
      socket.emit('leaveBoard', boardId, userId);
      socket.off('boardUpdated');
      socket.off('presenceUpdate');
      socket.off('typingUpdate');
      socket.off('notification');
      socket.disconnect();
    };
  }, [boardId]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    let toColumnId = over.id;
    const overIsColumn = board.columns.some(col => col.id === over.id);
    if (!overIsColumn) {
      const overCardColumn = board.columns.find(col => col.cards.some(c => c.id === over.id));
      if (overCardColumn) {
        toColumnId = overCardColumn.id;
      }
    }

    api.put(`/cards/${active.id}/move`, {
      toColumnId: toColumnId,
      toPosition: 0 // Simplified for now
    }).catch(err => console.error("Failed to move card", err));
  };

  if (loading) return <div className="loading-screen">Loading Board...</div>;
  if (!board) return <div className="loading-screen">Board not found.</div>;

  const columnIds = board.columns?.map(col => col.id) || [];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-slate-100 to-blue-200 flex flex-col items-center py-8 px-2">
      <div className="w-full max-w-7xl mx-auto mb-8">
        <h2 className="text-4xl font-extrabold text-blue-900 tracking-tight mb-2 text-center drop-shadow-lg">{board.title}</h2>
        <PresenceBar onlineUsers={onlineUsers} typingUsers={typingUsers} />
      </div>

      <div className="w-full max-w-4xl mx-auto mb-6">
        <NotificationBar notifications={notifications} />
        <AuditLog boardId={board.id} />
      </div>

      <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="w-full max-w-7xl flex gap-8 overflow-x-auto py-4 px-2 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100">
          <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
            {board.columns?.map(col => (
              <Column key={col.id} column={col} />
            ))}
          </SortableContext>
          <div className="bg-white/80 rounded-xl p-6 w-72 flex-shrink-0 h-fit shadow-xl border-2 border-blue-200 backdrop-blur-md">
            <AddColumnForm boardId={board.id} />
          </div>
        </div>
      </DndContext>
    </div>
  );
}

export default BoardView;