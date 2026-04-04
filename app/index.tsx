import { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTodo } from '../context/TodoContext';

export default function HomeScreen() {
  const { categories, todos, trashItems, setCategories, setTodos, moveCategoryToTrash, deleteCategory } = useTodo();
  const [newCategoryName, setNewCategoryName] = useState('');
  const totalTodos = Object.values(todos).flat().length;
  const completedTodos = Object.values(todos).flat().filter((t: any) => t.completed).length;

  const handleCreateCategory = () => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) {
      Alert.alert('名稱不可空白', '請輸入資料夾名稱');
      return;
    }

    const newId = Date.now().toString();
    const newCategory = {
      id: newId,
      name: trimmedName,
      icon: 'folder',
      count: 0,
    };

    setCategories((prev: any) => [...prev, newCategory]);
    setTodos((prev: any) => ({ ...prev, [newId]: [] }));
    setNewCategoryName('');
  };

  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    if (Platform.OS === 'web') {
      // For web: use confirm for permanent delete; cancel will move to trash
      const permanently = window.confirm(`警告!!!   確定要永久刪除「${categoryName}」資料夾？按「確定」將永久刪除，資料則是移至最近刪除。`);
      if (permanently) {
        console.log('Permanently deleting category (web):', categoryId);
        deleteCategory(categoryId);
      } else {
        console.log('Moving category to trash (web):', categoryId);
        moveCategoryToTrash(categoryId);
      }
      return;
    }

    // On native: offer three-button alert: Cancel / Move to Trash / Delete Permanently
    Alert.alert('刪除資料夾', `您想如何處理「${categoryName}」資料夾？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '移到垃圾桶',
        onPress: () => {
          console.log('Moving category to trash:', categoryId);
          moveCategoryToTrash(categoryId);
        },
      },
      {
        text: '永久刪除',
        style: 'destructive',
        onPress: () => {
          console.log('Permanently deleting category:', categoryId);
          deleteCategory(categoryId);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.title}>我的待辦清單</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalTodos}</Text>
            <Text style={styles.summaryLabel}>總任務</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{completedTodos}</Text>
            <Text style={styles.summaryLabel}>已完成</Text>
          </View>
        </View>

        <View style={styles.newFolderRow}>
          <TextInput
            style={styles.newFolderInput}
            placeholder="新增資料夾名稱"
            value={newCategoryName}
            onChangeText={setNewCategoryName}
            returnKeyType="done"
            onSubmitEditing={handleCreateCategory}
          />
          <TouchableOpacity style={styles.newFolderButton} onPress={handleCreateCategory} activeOpacity={0.85}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={[...categories, { id: 'trash', name: '垃圾桶', icon: 'trash', isTrash: true }]}
        keyExtractor={item => item.id}
        extraData={[categories, trashItems, todos]}
        renderItem={({ item }) => {
          const isTrash = (item as any).isTrash;
          const listTodos = isTrash ? [] : todos[item.id] || [];
          const unfinishedCount = isTrash
            ? trashItems.length
            : listTodos.filter((t: any) => !t.completed).length;

          return (
            <View style={styles.cardContainer}>
              <TouchableOpacity
                style={[styles.categoryCard, isTrash && styles.trashCard]}
                activeOpacity={0.85}
                onPress={() => {
                  if (isTrash) {
                    router.push({ pathname: '/trash' });
                    return;
                  }

                  router.push({
                    pathname: '/todolist',
                    params: { categoryId: item.id, categoryName: item.name },
                  });
                }}
              >
                <View style={styles.categoryHeader}>
                  <View style={styles.iconContainer}>
                    <Ionicons name={item.icon as any} size={22} color="#4B7FF0" />
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unfinishedCount}</Text>
                  </View>
                </View>
                <Text style={styles.categoryName}>{item.name}</Text>
                <Text style={styles.categoryDetail}>
                  {isTrash ? `${trashItems.length} 個已刪除` : `${listTodos.length} 項任務`}
                </Text>
              </TouchableOpacity>

              {!isTrash && (
                <TouchableOpacity
                  style={styles.deleteCategoryButton}
                  onPress={() => handleDeleteCategory(item.id, item.name)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        numColumns={2}
        contentContainerStyle={styles.categoryList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFF4FF' },
  headerCard: {
    margin: 16,
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#0B1220', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#5D6870', lineHeight: 22 },
  summaryRow: { flexDirection: 'row', marginTop: 18 },
  summaryItem: { marginRight: 24 },
  summaryValue: { fontSize: 24, fontWeight: '700', color: '#1D4ED8' },
  summaryLabel: { marginTop: 4, fontSize: 13, color: '#6B7280' },
  categoryList: { paddingHorizontal: 12, paddingBottom: 24 },
  cardContainer: {
    margin: 10,
    flex: 1,
    position: 'relative',
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    minHeight: 140,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  trashCard: {
    borderWidth: 1,
    borderColor: '#F87171',
  },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconContainer: { backgroundColor: '#E8EEFF', padding: 10, borderRadius: 16 },
  badge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: { fontSize: 14, color: '#1D4ED8', fontWeight: '700' },
  categoryName: { fontSize: 17, fontWeight: '700', color: '#111827', marginTop: 12 },
  categoryDetail: { fontSize: 14, color: '#6B7280', marginTop: 8 },
  deleteCategoryButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  newFolderRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  newFolderInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#F3F6FF',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  newFolderButton: {
    marginLeft: 12,
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
