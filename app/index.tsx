import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Modal, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTodo } from '../context/TodoContext';

export default function HomeScreen() {
  const { categories, todos, trashItems, setCategories, setTodos, moveCategoryToTrash, deleteCategory } = useTodo();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [inputError, setInputError] = useState('');
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const categoryColorOptions = ['#4B7FF0', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  const [selectedColor, setSelectedColor] = useState(categoryColorOptions[0]);
  const totalTodos = Object.values(todos).flat().length;
  const completedTodos = Object.values(todos).flat().filter((t: any) => t.completed).length;

  const handleCreateCategory = () => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) {
      setInputError('請輸入資料夾名稱');
      return;
    }

    const newId = Date.now().toString();
    const newCategory = {
      id: newId,
      name: trimmedName,
      icon: 'folder',
      count: 0,
      color: selectedColor,
    };

    setCategories((prev: any) => [...prev, newCategory]);
    setTodos((prev: any) => ({ ...prev, [newId]: [] }));
    setNewCategoryName('');
    setInputError('');
    setSelectedColor(categoryColorOptions[0]);
    setShowNewCategoryModal(false);
  };

  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    if (Platform.OS === 'web') {
      // For web: default to move to trash, confirm for permanent delete
      const moveToTrash = window.confirm(`確定要將「${categoryName}」資料夾移到垃圾桶嗎？\n\n資料夾裡的待辦項目會移到垃圾桶，可以在垃圾桶中恢復。`);
      if (moveToTrash) {
        moveCategoryToTrash(categoryId);
      }
      return;
    }

    // On native: offer two-button alert: Cancel / Move to Trash (default)
    Alert.alert('刪除資料夾', `確定要將「${categoryName}」資料夾移到垃圾桶嗎？\n\n資料夾裡的待辦項目會移到垃圾桶，可以在垃圾桶中恢復。`, [
      { text: '取消', style: 'cancel' },
      {
        text: '移到垃圾桶',
        style: 'destructive',
        onPress: () => {
          moveCategoryToTrash(categoryId);
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
          <TouchableOpacity style={styles.openModalButton} onPress={() => setShowNewCategoryModal(true)} activeOpacity={0.85}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.openModalButtonText}>新增資料夾</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={showNewCategoryModal} animationType="slide" transparent onRequestClose={() => setShowNewCategoryModal(false)}>
          <View style={styles.modalWrapper}>
            <Pressable style={styles.modalOverlay} onPress={() => setShowNewCategoryModal(false)} />
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>新增資料夾</Text>
              <Text style={styles.modalSubtitle}>輸入名稱並選擇資料夾顏色</Text>
              <TextInput
                style={[styles.modalInput, inputError ? styles.inputError : null]}
                placeholder="資料夾名稱"
                placeholderTextColor="#9CA3AF"
                value={newCategoryName}
                onChangeText={(text) => {
                  setNewCategoryName(text);
                  if (inputError) setInputError('');
                }}
                returnKeyType="done"
                onSubmitEditing={handleCreateCategory}
              />
              {inputError ? <Text style={styles.errorText}>{inputError}</Text> : null}
              <Text style={styles.modalLabel}>資料夾顏色</Text>
              <View style={styles.colorPaletteRow}>
                {categoryColorOptions.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorSwatchActive,
                    ]}
                    onPress={() => setSelectedColor(color)}
                    activeOpacity={0.8}
                  />
                ))}
              </View>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity style={[styles.modalButton, styles.modalCancel]} onPress={() => setShowNewCategoryModal(false)} activeOpacity={0.85}>
                  <Text style={styles.modalCancelText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.modalSubmit]} onPress={handleCreateCategory} activeOpacity={0.85}>
                  <Text style={styles.modalSubmitText}>建立資料夾</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>

      <FlatList
        data={[...categories.filter((cat: any) => !cat.trashed), { id: 'trash', name: '垃圾桶', icon: 'trash', isTrash: true }]}
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
                  <View style={[styles.iconContainer, { backgroundColor: item.color || '#E8EEFF' }]}> 
                    <Ionicons name={item.icon as any} size={22} color="#FFFFFF" />
                  </View>
                  <View style={[styles.badge, { backgroundColor: (item.color || '#4B7FF0') + '22' }]}> 
                    <Text style={[styles.badgeText, { color: item.color || '#4B7FF0' }]}>{unfinishedCount}</Text>
                  </View>
                </View>
                <Text style={[styles.categoryName, { color: item.color || '#111827' }]}>{item.name}</Text>
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
  container: { flex: 1, backgroundColor: '#1D1D1D' },
  headerCard: {
    margin: 16,
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#565656',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#F8FAFC', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#D1D5DB', lineHeight: 22 },
  summaryRow: { flexDirection: 'row', marginTop: 18 },
  summaryItem: { marginRight: 24 },
  summaryValue: { fontSize: 24, fontWeight: '700', color: '#EAA626' },
  summaryLabel: { marginTop: 4, fontSize: 13, color: '#9CA3AF' },
  categoryList: { paddingHorizontal: 12, paddingBottom: 24 },
  cardContainer: {
    marginHorizontal: 8,
    marginBottom: 16,
    flex: 1,
    position: 'relative',
  },
  categoryCard: {
    backgroundColor: '#565656',
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
  iconContainer: { backgroundColor: '#424242', padding: 10, borderRadius: 16 },
  badge: {
    backgroundColor: '#424242',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: { fontSize: 14, color: '#F8FAFC', fontWeight: '700' },
  categoryName: { fontSize: 17, fontWeight: '700', color: '#F8FAFC', marginTop: 12 },
  categoryDetail: { fontSize: 14, color: '#9CA3AF', marginTop: 8 },
  deleteCategoryButton: {
    position: 'absolute',
    top: 90,
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#42222A',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  newFolderRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  openModalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAA626',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 18,
    shadowColor: '#EAA626',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  openModalButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  modalContent: {
    backgroundColor: '#565656',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -12 },
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 18,
  },
  modalInput: {
    width: '100%',
    backgroundColor: '#424242',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#4B5563',
    marginBottom: 10,
  },
  modalLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 10,
    fontWeight: '600',
  },
  modalButtonRow: {
    marginTop: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancel: {
    backgroundColor: '#6f6f6f',
    marginRight: 12,
  },
  modalSubmit: {
    backgroundColor: '#EAA626',
  },
  modalCancelText: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  colorPaletteRow: {
    flexDirection: 'row',
    marginTop: 14,
  },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchActive: {
    borderColor: '#111827',
    width: 34,
    height: 34,
  },
  newFolderInput: {
    flex: 1,
    height: 50,
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
  inputContainer: {
    flex: 1,
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
