import React, { createContext, useContext, useState } from 'react';

const TodoContext = createContext<any>(null);

export const TodoProvider = ({ children }: { children: React.ReactNode }) => {
  const [categories, setCategories] = useState([
    { id: '1', name: '提醒事項', icon: 'list', count: 0 },
    { id: '2', name: '專案開發', icon: 'code-slash', count: 0 },
  ]);

  const [todos, setTodos] = useState({});
  const [trashItems, setTrashItems] = useState<any[]>([]);

  const moveTodoToTrash = (todo: any, categoryId: string) => {
    const trashedTodo = { ...todo, categoryId, deletedAt: Date.now() };
    setTrashItems(prev => [trashedTodo, ...prev]);
    setTodos(prev => ({
      ...prev,
      [categoryId]: (prev[categoryId] || []).filter((item: any) => item.id !== todo.id),
    }));
  };

  const deleteCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(category => category.id !== categoryId));
    setTodos(prev => {
      const { [categoryId]: removed, ...rest } = prev;
      return rest;
    });
  };

  const restoreTodo = (todo: any) => {
    setTodos(prev => ({
      ...prev,
      [todo.categoryId]: [...(prev[todo.categoryId] || []), { ...todo, deletedAt: undefined }],
    }));
    setTrashItems(prev => prev.filter(item => item.id !== todo.id));
  };

  const deleteTrashItem = (id: string) => {
    setTrashItems(prev => prev.filter(item => item.id !== id));
  };

  const emptyTrash = () => {
    setTrashItems([]);
  };

  return (
    <TodoContext.Provider
      value={{
        categories,
        todos,
        trashItems,
        setTodos,
        setCategories,
        setTrashItems,
        moveTodoToTrash,
        deleteCategory,
        restoreTodo,
        deleteTrashItem,
        emptyTrash,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

export const useTodo = () => useContext(TodoContext);