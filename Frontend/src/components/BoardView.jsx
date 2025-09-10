function AuditLog({ boardId }) {
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    // Fetch audit log for this board
    api.get(`/boards/${boardId}/audit`)
      .then(res => setLogs(res.data))
      .catch(() => setLogs([]));
  }, [boardId]);
  return (
    <div className="mb-4">
      <strong className="text-gray-700">Audit Log:</strong>
      <ul className="pl-4 mt-2">
        {logs.map((log, idx) => (
          <li key={idx} className="text-xs text-gray-500 mb-1">
            [{new Date(log.createdAt).toLocaleTimeString()}] {log.eventType}: {log.details?.title || log.details?.message || ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { DndContext, closestCorners } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { horizontalListSortingStrategy } from '@dnd-kit/sortable';
import api from '../api';
import socket from '../socket';
import Column from './Column';

// Presence and typing indicator UI
function PresenceBar({ onlineUsers, typingUsers }) {
  return (
    <div className="text-sm text-gray-600">
      <strong>Online:</strong> {onlineUsers.length ? onlineUsers.join(", ") : "None"}
      {typingUsers.length > 0 && (
        <span className="ml-4 text-blue-600 font-medium">
          Typing: {typingUsers.join(", ")}
        </span>
      )}
    </div>
  );
}

// New component for adding a column
const AddColumnForm = ({ boardId }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await api.post('/columns', { title, boardId });
      setTitle(''); // Clear input after submission
    } catch (error) {
      console.error('Failed to create column', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter column title..."
        className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg bg-slate-50 focus:border-blue-500 focus:outline-none transition-colors"
      />
      <button 
        type="submit"
        className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
      >
        Add Column
      </button>
    </form>
  );
};

function BoardView() {
  const { boardId } = useParams();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  // Store card input state per column
  const [cardInputs, setCardInputs] = useState({});

  // Helper: deep compare two objects
  function deepEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  const boardRef = useRef(null);

  useEffect(() => {
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
      // Only update if board actually changed
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

    // Determine the target column ID
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
      toPosition: 0 // Simplified: always move to the top
    }).catch(err => console.error("Failed to move card", err));
  };

  if (loading) return <div>Loading board...</div>;
  if (!board) return <div>Board not found.</div>;

  const columnIds = board.columns?.map(col => col.id) || [];

  // Notification UI
  const NotificationBar = ({ notifications }) => (
    <div>
      {notifications.map((n, idx) => (
        <div key={idx} className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 mb-2 rounded-lg text-sm shadow-sm">
          {n.message}
        </div>
      ))}
    </div>
  );

  return (
  <div className="w-full min-h-screen px-2 md:px-8 py-8 bg-gradient-to-br from-slate-50/80 to-blue-100/60 flex flex-col items-center justify-start">
      <h2 className="text-4xl font-extrabold mb-8 text-blue-900 tracking-tight drop-shadow-lg">{board.title}</h2>
      <div className="mb-6">
        <NotificationBar notifications={notifications} />
      </div>
      <div className="mb-6">
        <PresenceBar onlineUsers={onlineUsers} typingUsers={typingUsers} />
      </div>
      <AuditLog boardId={board.id} />
      <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="w-full max-w-7xl overflow-x-auto flex gap-8 p-6 bg-gradient-to-r from-blue-50/80 via-slate-100/80 to-blue-100/60 rounded-2xl min-h-[400px] shadow-xl">
          <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
            {board.columns?.map(col => (
              <Column 
                key={col.id} 
                column={col} 
                cardInput={cardInputs[col.id] || ""}
                setCardInput={value => setCardInputs(inputs => ({ ...inputs, [col.id]: value }))}
              />
            ))}
          </SortableContext>
          <div className="p-6 bg-white/80 rounded-xl border-2 border-blue-200 shadow-lg h-fit backdrop-blur-md">
            <AddColumnForm boardId={board.id} />
          </div>
        </div>
      </DndContext>
    </div>
  );
}

export default BoardView;