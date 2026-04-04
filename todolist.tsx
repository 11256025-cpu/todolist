import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTodo } from '../context/TodoContext';

export default function TodoListScreen() {
  const { categoryId, categoryName } = useLocalSearchParams();
  const { todos, setTodos, moveTodoToTrash } = useTodo();
  const listTodos = todos[categoryId as string] || [];
  const [showInput, setShowInput] = useState(false);
  const [inputText, setInputText] = useState('');
  const [editItem, setEditItem] = useState<any>(null);

  const getRandomColor = () => {
    const colors = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#00C7BE', '#32ADE6', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const updateTodos = (newTodos: any[]) => {
    setTodos((prev: any) => ({ ...prev, [categoryId as string]: newTodos }));
  };

  const handleSaveTodo = (text: string) => {
    if (text.trim() === '') return;

    if (editItem) {
      const updated = listTodos.map(t => (t.id === editItem.id ? { ...t, text } : t));
      updateTodos(updated);
      setEditItem(null);
    } else {
      const newTodo = {
        id: Date.now().toString(),
        text,
        completed: false,
        color: getRandomColor(),
      };
      updateTodos([...listTodos, newTodo]);
    }
  };

  const showAddModal = () => {
    if (Platform.OS === 'web') {
      const text = window.prompt('新增待辦事項', '請輸入內容');
      if (text) handleSaveTodo(text);
      return;
    }

    if ((Alert as any).prompt) {
      (Alert as any).prompt('新增待辦事項', '請輸入內容', [
        { text: '取消', style: 'cancel' },
        { text: '新增', onPress: (text: string) => text?.trim() && handleSaveTodo(text) },
      ]);
      return;
    }

    setShowInput(true);
  };

  const toggleComplete = (id: string) => {
    const updated = listTodos.map(t => (t.id === id ? { ...t, completed: !t.completed } : t));
    updateTodos(updated);
  };

  const deleteTodo = (todo: any) => {
    if (Platform.OS === 'web') {
      moveTodoToTrash(todo, categoryId as string);
      return;
    }

    Alert.alert('刪除', '確定要刪除這個待辦事項嗎？', [
      { text: '取消', style: 'cancel' },
      {
        text: '刪除',
        style: 'destructive',
        onPress: () => moveTodoToTrash(todo, categoryId as string),
      },
    ]);
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setInputText(item.text);
    setShowInput(true);
  };

  const confirmSaveFromInput = () => {
    handleSaveTodo(inputText);
    setInputText('');
    setShowInput(false);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
      <Stack.Screen options={{ title: categoryName as string }} />

      <View style={styles.headerSection}>
        <Text style={styles.sectionTitle}>{categoryName}</Text>
      </View>

      <FlatList
        data={listTodos}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.todoItem}>
            <TouchableOpacity onPress={() => toggleComplete(item.id)} style={styles.checkboxContainer} activeOpacity={0.7}>
              <Ionicons
                name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
                size={28}
                color={item.completed ? '#D1D1D6' : item.color}
              />
            </TouchableOpacity>
            <View style={styles.todoTextContainer}>
              <Text style={[styles.todoText, item.completed && styles.todoTextCompleted]}>{item.text}</Text>
            </View>
            <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editButton} activeOpacity={0.7}>
              <Ionicons name="pencil-outline" size={20} color="#4B5563" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteTodo(item)} style={styles.trashButton} activeOpacity={0.7}>
              <Ionicons name="trash-outline" size={22} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>沒有提醒事項</Text>}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {showInput && (
        <View style={styles.inputOverlay}>
          <TextInput
            style={styles.input}
            placeholder={editItem ? '修改待辦事項...' : '新增待辦事項...'}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={confirmSaveFromInput}
            autoFocus
          />
          <TouchableOpacity style={styles.saveButton} onPress={confirmSaveFromInput} activeOpacity={0.85}>
            <Text style={styles.saveButtonText}>儲存</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.fab} onPress={showAddModal} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  headerSection: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  sectionTitle: { fontSize: 32, fontWeight: '800', color: '#F97316' },
  listContent: { paddingHorizontal: 20, paddingBottom: 140 },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  checkboxContainer: { marginRight: 12 },
  todoTextContainer: { flex: 1 },
  todoText: { fontSize: 16, color: '#111827' },
  todoTextCompleted: { color: '#9CA3AF', textDecorationLine: 'line-through' },
  editButton: { padding: 8, marginRight: 8, borderRadius: 12 },
  trashButton: { padding: 8, borderRadius: 12 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#6B7280', fontSize: 16 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 26,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  inputOverlay: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 110,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#F97316',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});
