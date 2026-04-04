import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

const TodoContext = createContext<any>(null);
const STORAGE_KEY = 'TODOLIST_APP_STATE';
const defaultCategories = [
  { id: '1', name: '提醒事項', icon: 'list', count: 0, color: '#4B7FF0' },
  { id: '2', name: '專案開發', icon: 'code-slash', count: 0, color: '#10B981' },
];

export const TodoProvider = ({ children }: { children: React.ReactNode }) => {
  const isWeb = Platform.OS === 'web';
  const [categories, setCategories] = useState<any[] | null>(isWeb ? null : defaultCategories);
  const [todos, setTodos] = useState<Record<string, any[]> | null>(isWeb ? null : {});
  const [trashItems, setTrashItems] = useState<any[] | null>(isWeb ? null : []);
  const [isHydrated, setIsHydrated] = useState(!isWeb);

  useEffect(() => {
    if (!isWeb || typeof window === 'undefined') return;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed?.categories)) {
          setCategories(parsed.categories);
        } else {
          setCategories(defaultCategories);
        }
        if (parsed?.todos && typeof parsed.todos === 'object') setTodos(parsed.todos);
        else setTodos({});
        if (parsed?.trashItems && Array.isArray(parsed.trashItems)) setTrashItems(parsed.trashItems);
        else setTrashItems([]);
      } else {
        setCategories(defaultCategories);
        setTodos({});
        setTrashItems([]);
      }
    } catch (error) {
      console.warn('Failed to load saved todo state:', error);
      setCategories(defaultCategories);
      setTodos({});
      setTrashItems([]);
    } finally {
      setIsHydrated(true);
    }
  }, [isWeb]);

  useEffect(() => {
    if (!isHydrated || !isWeb) return;
    try {
      const savedState = JSON.stringify({ categories, todos, trashItems });
      window.localStorage.setItem(STORAGE_KEY, savedState);
    } catch (error) {
      console.warn('Failed to save todo state:', error);
    }
  }, [isHydrated, isWeb, categories, todos, trashItems]);

  const moveTodoToTrash = (todo: any, categoryId?: string) => {
    const catId = categoryId || todo?.categoryId;
    const category = categories.find(c => c.id === catId);
    const trashedTodo = {
      ...todo,
      categoryId: catId,
      categoryName: category?.name,
      categoryColor: category?.color,
      categoryIcon: category?.icon,
      deletedAt: Date.now()
    };
    setTrashItems(prev => [trashedTodo, ...prev]);
    if (!catId) {
      // if categoryId cannot be determined, just remove from any matching lists
      setTodos((prev: Record<string, any[]>) => {
        const newPrev: Record<string, any[]> = {};
        Object.keys(prev).forEach(key => {
          newPrev[key] = prev[key].filter((item: any) => item.id !== todo.id);
        });
        return newPrev;
      });
      return;
    }

    setTodos((prev: Record<string, any[]>) => ({
      ...prev,
      [catId]: (prev[catId] || []).filter((item: any) => item.id !== todo.id),
    }));
  };

  const deleteCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(category => category.id !== categoryId));
    setTodos((prev: Record<string, any[]>) => {
      const { [categoryId]: removed, ...rest } = prev as Record<string, any[]>;
      return rest;
    });
  };

  const moveCategoryToTrash = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    const items = todos[categoryId] || [];
    const trashed = items.map((t: any) => ({
      ...t,
      categoryId,
      categoryName: category?.name,
      categoryColor: category?.color,
      categoryIcon: category?.icon,
      deletedAt: Date.now()
    }));

    // add trashed todos
    setTrashItems(prev => [...trashed, ...prev]);

    // mark category as trashed but keep its entry so it can be restored later
    setCategories(prev => prev.map(cat => (cat.id === categoryId ? { ...cat, trashed: true } : cat)));

    // clear todos for the category so it doesn't show in active lists
    setTodos((prev: Record<string, any[]>) => ({ ...prev, [categoryId]: [] }));
  };

  const restoreCategory = (categoryId: string) => {
    // unmark category
    setCategories(prev => prev.map(cat => (cat.id === categoryId ? { ...cat, trashed: false } : cat)));

    // move trashed items belonging to this category back to todos
    setTodos((prev: Record<string, any[]>) => {
      const restored = trashItems.filter(item => item.categoryId === categoryId).map(item => {
        const copy = { ...item };
        delete copy.deletedAt;
        delete copy.categoryName;
        return copy;
      });
      return { ...prev, [categoryId]: [...(prev[categoryId] || []), ...restored] };
    });

    // remove restored items from trash
    setTrashItems(prev => prev.filter(item => item.categoryId !== categoryId));
  };

  const restoreTodo = (todo: any) => {
    // Check if category exists, if not, recreate it
    setCategories((prev: any[]) => {
      const existingCategory = prev.find(cat => cat.id === todo.categoryId);
      if (existingCategory) {
        // If category exists but is trashed, untrash it
        if (existingCategory.trashed) {
          return prev.map(cat => cat.id === todo.categoryId ? { ...cat, trashed: false } : cat);
        }
        return prev;
      }
      const newCategory = {
        id: todo.categoryId,
        name: todo.categoryName || '已恢復資料夾',
        icon: todo.categoryIcon || 'folder',
        count: 0,
        color: todo.categoryColor || '#4B7FF0',
      };
      return [
        ...prev,
        newCategory,
      ];
    });

    // Clean up trash-specific properties before restoring
    const { deletedAt, categoryName, categoryColor, categoryIcon, ...cleanTodo } = todo;

    setTodos((prev: Record<string, any[]>) => ({
      ...prev,
      [todo.categoryId]: [...(prev[todo.categoryId] || []), cleanTodo],
    }));
    setTrashItems(prev => prev.filter(item => item.id !== todo.id));
  };

  const deleteTrashItem = (id: string) => {
    setTrashItems(prev => prev.filter(item => item.id !== id));
  };

  const emptyTrash = () => {
    setTrashItems([]);
    // Also remove all trashed categories
    setCategories(prev => prev.filter((cat: any) => !cat.trashed));
  };

  if (isWeb && !isHydrated) {
    return null;
  }

  return (
    <TodoContext.Provider
      value={{
        categories: categories || [],
        todos: todos || {},
        trashItems: trashItems || [],
        setTodos,
        setCategories,
        setTrashItems,
        moveTodoToTrash,
    moveCategoryToTrash,
    restoreCategory,
    restoreTodo,
        deleteCategory,
        deleteTrashItem,
        emptyTrash,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

export const useTodo = () => useContext(TodoContext);