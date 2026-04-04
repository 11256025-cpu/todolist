import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  Modal,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTodo } from '../context/TodoContext';

export default function TodoListScreen() {
  const { categoryId, categoryName } = useLocalSearchParams();
  const { todos, setTodos, moveTodoToTrash } = useTodo();
  const listTodos: any[] = todos[categoryId as string] || [];
  const [inputText, setInputText] = useState('');
  const [editItem, setEditItem] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const getRandomColor = () => {
    const colors = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#00C7BE', '#32ADE6', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const updateTodos = (newTodos: any[]) => {
    setTodos((prev: any) => ({ ...prev, [categoryId as string]: newTodos }));
  };

  const handleSaveTodo = () => {
    if (inputText.trim() === '') return;

    if (editItem) {
      const updated = listTodos.map((item: any) => (item.id === editItem.id ? { ...item, text: inputText } : item));
      updateTodos(updated);
      setEditItem(null);
      setShowEditModal(false);
    } else {
      const newTodo = {
        id: Date.now().toString(),
        text: inputText,
        completed: false,
        color: getRandomColor(),
      };
      updateTodos([...listTodos, newTodo]);
    }

    setInputText('');
  };

  const toggleComplete = (id: string) => {
  const updated = listTodos.map((item: any) => (item.id === id ? { ...item, completed: !item.completed } : item));
    updateTodos(updated);
  };

  const deleteTodo = (todo: any) => {
    if (Platform.OS === 'web') {
      moveTodoToTrash(todo, categoryId as string);
      return;
    }

    Alert.alert('刪除提醒事項', '確定要將此項目移到垃圾桶嗎？', [
      { text: '取消', style: 'cancel' },
      {
        text: '確定',
        style: 'destructive',
        onPress: () => moveTodoToTrash(todo, categoryId as string),
      },
    ]);
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setInputText(item.text);
    setShowEditModal(true);
  };

  const renderTodo = ({ item }: { item: any }) => (
    <View style={styles.todoCard}>
      <TouchableOpacity style={styles.todoLeft} onPress={() => toggleComplete(item.id)} activeOpacity={0.8}>
        <View style={[styles.todoBullet, { backgroundColor: item.completed ? '#D1D1D6' : item.color }]}>
          {item.completed && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
        </View>
        <View style={styles.todoTextWrapper}>
          <Text style={[styles.todoText, item.completed && styles.todoCompleted]}>{item.text}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.todoActions}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)} activeOpacity={0.7}>
          <Ionicons name="pencil-outline" size={18} color="#4B5563" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteTodo(item)} activeOpacity={0.7}>
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <Stack.Screen options={{ title: categoryName as string }} />

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{categoryName}</Text>
          <Text style={styles.subtitle}>{listTodos.length} 個提醒事項</Text>
        </View>
      </View>

      <FlatList
        data={listTodos}
        keyExtractor={item => item.id}
        renderItem={renderTodo}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>目前沒有提醒事項，新增一個開始吧！</Text>}
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={showEditModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editItem ? '編輯代辦' : '新增代辦'}</Text>
            <TextInput
              style={styles.modalInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="輸入代辦內容"
              placeholderTextColor="#9CA3AF"
              returnKeyType="done"
              onSubmitEditing={handleSaveTodo}
            />
            <View style={styles.modalButtons}>
              <Pressable style={[styles.modalButton, styles.modalCancel]} onPress={() => { setShowEditModal(false); setEditItem(null); setInputText(''); }}>
                <Text style={styles.modalButtonText}>取消</Text>
              </Pressable>
              <Pressable style={[styles.modalButton, styles.modalSave]} onPress={handleSaveTodo}>
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>儲存</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.footer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder={editItem ? '修改待辦事項...' : '新增待辦事項...'}
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
            returnKeyType="done"
            onSubmitEditing={handleSaveTodo}
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleSaveTodo} activeOpacity={0.85}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  title: { fontSize: 32, fontWeight: '800', color: '#111827' },
  subtitle: { marginTop: 6, fontSize: 16, color: '#6B7280' },
  listContent: { paddingHorizontal: 20, paddingBottom: 140 },
  todoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  todoLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  todoBullet: {
    width: 30,
    height: 30,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  todoTextWrapper: { flex: 1 },
  todoText: { fontSize: 16, color: '#111827' },
  todoCompleted: { color: '#9CA3AF', textDecorationLine: 'line-through' },
  todoActions: { flexDirection: 'row', alignItems: 'center' },
  editButton: { marginRight: 12, padding: 10, borderRadius: 14, backgroundColor: '#F3F4F6' },
  deleteButton: { padding: 10, borderRadius: 14, backgroundColor: '#FEF2F2' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#6B7280', fontSize: 16 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: '#F7F7F7',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  input: { flex: 1, fontSize: 16, color: '#111827', paddingVertical: 10, paddingHorizontal: 0 },
  submitButton: { width: 52, height: 52, borderRadius: 18, backgroundColor: '#F97316', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 560, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 18 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 10 },
  modalInput: { backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: '#111827', marginBottom: 14 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalButton: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, marginLeft: 10 },
  modalCancel: { backgroundColor: '#F3F4F6' },
  modalSave: { backgroundColor: '#2563EB' },
  modalButtonText: { fontSize: 16, fontWeight: '700', color: '#111827' }
});
