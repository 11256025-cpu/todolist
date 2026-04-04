import React, { createContext, useContext, useState } from 'react';

const TodoContext = createContext<any>(null);

export const TodoProvider = ({ children }: { children: React.ReactNode }) => {
  const [categories, setCategories] = useState([
    { id: '1', name: '提醒事項', icon: 'list', count: 0 },
    { id: '2', name: '專案開發', icon: 'code-slash', count: 0 },
  ]);

  // todos 資料結構會像這樣： { '1': [{id, text, completed, color}], '2': [...] }
  const [todos, setTodos] = useState({});

  return (
    <TodoContext.Provider value={{ categories, todos, setTodos, setCategories }}>
      {children}
    </TodoContext.Provider>
  );
};

export const useTodo = () => useContext(TodoContext);