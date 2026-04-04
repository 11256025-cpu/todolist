import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, 
  KeyboardAvoidingView, Platform, Alert 
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTodo } from '../context/TodoContext';

export default function TodoListScreen() {
  // 接收首頁傳遞過來的參數
  const { categoryId, categoryName } = useLocalSearchParams();
  const { todos, setTodos } = useTodo();
  
  const [listTodos, setListTodos] = useState<any[]>(todos[categoryId as string] || []);
  const [inputText, setInputText] = useState('');
  const [editItem, setEditItem] = useState<any>(null);

  const getRandomColor = () => {
    const colors = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#00C7BE', '#32ADE6', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const updateTodos = (newTodos: any[]) => {
    setListTodos(newTodos);
    setTodos((prev: any) => ({ ...prev, [categoryId as string]: newTodos }));
  };

  const handleSaveTodo = () => {
    if (inputText.trim() === '') return;

    if (editItem) {
      const updated = listTodos.map(t => t.id === editItem.id ? { ...t, text: inputText } : t);
      updateTodos(updated);
      setEditItem(null);
    } else {
      const newTodo = {
        id: Date.now().toString(),
        text: inputText,
        completed: false,
        color: getRandomColor()
      };
      updateTodos([...listTodos, newTodo]);
    }
    setInputText('');
  };

  const toggleComplete = (id: string) => {
    const updated = listTodos.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    updateTodos(updated);
  };

  const deleteTodo = (id: string) => {
    Alert.alert('刪除', '確定要刪除這個待辦事項嗎？', [
      { text: '取消', style: 'cancel' },
      { text: '刪除', style: 'destructive', onPress: () => {
        const updated = listTodos.filter(t => t.id !== id);
        updateTodos(updated);
      }},
    ]);
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setInputText(item.text);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* 動態設定上方導覽列的標題 */}
      <Stack.Screen options={{ title: categoryName as string }} />

      <FlatList
        data={listTodos}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.todoItem}>
            <TouchableOpacity onPress={() => toggleComplete(item.id)} style={styles.checkboxContainer}>
              <Ionicons 
                name={item.completed ? "checkmark-circle" : "ellipse-outline"} 
                size={28} 
                color={item.completed ? "#D1D1D6" : item.color} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.todoTextContainer} onPress={() => handleEdit(item)} onLongPress={() => deleteTodo(item.id)}>
              <Text style={[styles.todoText, item.completed && styles.todoTextCompleted]}>
                {item.text}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => deleteTodo(item.id)}>
              <Ionicons name="trash-outline" size={22} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>目前沒有待辦事項</Text>}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={editItem ? "修改待辦事項..." : "新增待辦事項..."}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSaveTodo}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleSaveTodo}>
          <Text style={styles.addButtonText}>{editItem ? "儲存" : "新增"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  todoItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  checkboxContainer: { marginRight: 12 },
  todoTextContainer: { flex: 1 },
  todoText: { fontSize: 17, color: '#000' },
  todoTextCompleted: { color: '#8E8E93', textDecorationLine: 'line-through' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#8E8E93', fontSize: 16 },
  inputContainer: { flexDirection: 'row', padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E5EA', alignItems: 'center' },
  input: { flex: 1, height: 40, backgroundColor: '#F2F2F7', borderRadius: 10, paddingHorizontal: 12, fontSize: 16, marginRight: 12 },
  addButton: { backgroundColor: '#007AFF', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  addButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 }
});