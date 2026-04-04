import { useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTodo } from '../context/TodoContext';

export default function HomeScreen() {
  const { categories, todos, trashItems, setCategories, setTodos, deleteCategory } = useTodo();
  const totalTodos = Object.values(todos).flat().length;
  const completedTodos = Object.values(todos).flat().filter((t: any) => t.completed).length;

  const summaryCards = [
    { id: 'today', title: '今天', count: 0, icon: 'sunny-outline', color: '#60A5FA' },
    { id: 'scheduled', title: '已排程', count: 0, icon: 'calendar-outline', color: '#F59E0B' },
    { id: 'all', title: '全部', count: totalTodos, icon: 'list-outline', color: '#3B82F6' },
    { id: 'completed', title: '已完成', count: completedTodos, icon: 'checkmark-done-outline', color: '#10B981' },
  ];

  const createCategory = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const newId = Date.now().toString();
    const newCategory = { id: newId, name: trimmedName, icon: 'folder', count: 0 };
    setCategories((prev: any) => [...prev, newCategory]);
    setTodos((prev: any) => ({ ...prev, [newId]: [] }));
  };

  const handleAddCategory = () => {
    if (Platform.OS === 'web') {
      const name = window.prompt('新增資料夾', '請輸入資料夾名稱');
      if (name) createCategory(name);
      return;
    }

    if ((Alert as any).prompt) {
      (Alert as any).prompt('新增資料夾', '請輸入資料夾名稱', [
        { text: '取消', style: 'cancel' },
        { text: '新增', onPress: (text: string) => text?.trim() && createCategory(text) },
      ]);
      return;
    }

    Alert.alert('新增資料夾', '目前此平台暫不支援直接輸入，請使用其他方式新增資料夾。');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>我的列表</Text>
        <View style={styles.topActions}>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.85}>
            <Ionicons name="search-outline" size={20} color="#1F2937" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.editButton} activeOpacity={0.85}>
            <Text style={styles.editText}>編輯</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summaryGrid}>
        {summaryCards.map(card => (
          <View key={card.id} style={styles.summaryCard}>
            <View style={styles.summaryCardHeader}>
              <View style={[styles.summaryIcon, { backgroundColor: `${card.color}22` }]}>
                <Ionicons name={card.icon as any} size={20} color={card.color} />
              </View>
              <Text style={styles.summaryCardTitle}>{card.title}</Text>
            </View>
            <Text style={styles.summaryCount}>{card.count}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>我的列表</Text>

      <FlatList
        data={categories}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const listTodos = todos[item.id] || [];
          const unfinishedCount = listTodos.filter((t: any) => !t.completed).length;
          return (
            <TouchableOpacity
              style={styles.listItem}
              activeOpacity={0.85}
              onPress={() => router.push({ pathname: '/todolist', params: { categoryId: item.id, categoryName: item.name } })}
            >
              <View style={styles.listIcon}>
                <Ionicons name={item.icon as any} size={20} color="#FFFFFF" />
              </View>
              <View style={styles.listTextContainer}>
                <Text style={styles.listTitle}>{item.name}</Text>
                <Text style={styles.listSubtitle}>{unfinishedCount} 項任務</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert('刪除資料夾', `確定要刪除「${item.name}」資料夾，並移除所有包含的任務嗎？`, [
                    { text: '取消', style: 'cancel' },
                    { text: '刪除', style: 'destructive', onPress: () => deleteCategory(item.id) },
                  ]);
                }}
                style={styles.deleteCategoryButton}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={styles.fab} onPress={handleAddCategory} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  topBar: {
    marginTop: 20,
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageTitle: { fontSize: 30, fontWeight: '800', color: '#111827' },
  topActions: { flexDirection: 'row', alignItems: 'center' },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  editButton: {
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  editText: { fontSize: 15, fontWeight: '700', color: '#111827' },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 20,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  summaryCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  summaryIcon: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  summaryCardTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  summaryCount: { fontSize: 32, fontWeight: '800', color: '#111827' },
  sectionTitle: { marginTop: 22, marginHorizontal: 16, fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 12 },
  listContent: { paddingHorizontal: 16, paddingBottom: 140 },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  listIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#4B7FF0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  listTextContainer: { flex: 1 },
  listTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  listSubtitle: { marginTop: 4, fontSize: 13, color: '#6B7280' },
  deleteCategoryButton: { marginLeft: 12, padding: 8, borderRadius: 12 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 26,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FB923C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
});
