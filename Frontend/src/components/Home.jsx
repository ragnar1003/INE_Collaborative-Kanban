import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api'; // Use the configured api instance

function Home() {
  const [boards, setBoards] = useState([]);
  const [newBoardTitle, setNewBoardTitle] = useState('');

  useEffect(() => {
    // Fetch user's boards
    api.get('/boards')
      .then(res => setBoards(res.data))
      .catch(err => console.error("Could not fetch boards", err));
  }, []);

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/boards', { title: newBoardTitle });
      setBoards([...boards, res.data]); // Add new board to the list
      setNewBoardTitle('');
    } catch (error) {
      console.error('Failed to create board', error);
    }
  };

  return (
    <div>
      <h1>My Kanban Boards</h1>
      <form onSubmit={handleCreateBoard}>
        <input 
          type="text" 
          value={newBoardTitle} 
          onChange={(e) => setNewBoardTitle(e.target.value)}
          placeholder="New Board Title"
        />
        <button type="submit">Create Board</button>
      </form>
      <ul>
        {boards.map(board => (
          <li key={board.id}>
            <Link to={`/board/${board.id}`}>{board.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;