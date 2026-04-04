import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTodo } from '../context/TodoContext';

export default function TrashScreen() {
  const { trashItems, restoreTodo, deleteTrashItem, emptyTrash, deleteTrashedCategory, categories, restoreCategory } = useTodo();

  const trashedCategories = categories.filter((cat: any) => cat.trashed);
  const allTrashItems = [...trashItems, ...trashedCategories.map((cat: any) => ({ ...cat, isCategory: true }))];

  const getCategoryName = (categoryId: string, categoryName?: string) => {
    return categories.find((category: any) => category.id === categoryId)?.name || categoryName || '已刪除分類';
  };

  const showConfirm = (
    title: string,
    message: string,
    confirmText: string,
    onConfirm: () => void
  ) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (window.confirm(`${title}\n\n${message}`)) {
        onConfirm();
      }
      return;
    }

    Alert.alert(title, message, [
      { text: '取消', style: 'cancel' },
      { text: confirmText, style: 'destructive', onPress: onConfirm },
    ]);
  };

  const confirmRestore = (item: any) => {
    restoreTodo(item);
  };

  const confirmDeletePermanent = (id: string) => {
    showConfirm('永久刪除', '這個項目將無法恢復，確定要刪除嗎？', '刪除', () => deleteTrashItem(id));
  };

  const handleEmptyTrash = () => {
    if (trashItems.length === 0) return;

    showConfirm('清空垃圾桶', '確定要永久刪除所有項目嗎？', '清空', emptyTrash);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '垃圾桶' }} />

      <View style={styles.headerCardContent}>
        <View style={styles.topBadge}>
          <Text style={styles.topBadgeText}>垃圾桶</Text>
        </View>
        <Text style={styles.title}>最近刪除</Text>
        <Text style={styles.subtitle}>已刪除的代辦事項可以在此恢復或永久清除，保護你的工作清單不被誤刪。</Text>

        {trashItems.length > 0 && (
          <View style={styles.overviewRow}>
            <View>
              <Text style={styles.overviewCount}>{trashItems.length}</Text>
              <Text style={styles.overviewLabel}>已刪除項目</Text>
            </View>
            <Pressable onPress={handleEmptyTrash} style={({ pressed }) => [styles.clearButton, pressed && styles.clearButtonPressed]}>
              <Text style={styles.clearButtonText}>清空垃圾桶</Text>
            </Pressable>
          </View>
        )}
      </View>

      <FlatList
        data={allTrashItems}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>垃圾桶是空的</Text>
            <Text style={styles.emptyText}>沒有任何已刪除的代辦事項或資料夾。</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isCategory = item.isCategory;
          return (
            <View style={styles.trashItem}>
              <View style={[styles.colorDot, { backgroundColor: isCategory ? item.color || '#8B5CF6' : item.color || '#D1D1D6' }]} />
              <View style={styles.trashTextContainer}>
                <Text style={styles.trashTitle}>{isCategory ? `📁 ${item.name}` : item.text}</Text>
                <Text style={styles.trashSubtitle}>
                  {isCategory ? '已刪除的資料夾' : getCategoryName(item.categoryId, item.categoryName)}
                </Text>
              </View>
              <TouchableOpacity style={[styles.actionButton, styles.restoreButton]} onPress={() => {
                if (isCategory) {
                  restoreCategory(item.id);
                } else {
                  confirmRestore(item);
                }
              }} activeOpacity={0.7}>
                <Ionicons name="arrow-undo-outline" size={20} color="#047857" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => {
                if (isCategory) {
                  showConfirm('永久刪除資料夾', '這個資料夾將無法恢復，確定要刪除嗎？', '刪除', () => {
                    deleteTrashedCategory(item.id);
                  });
                } else {
                  confirmDeletePermanent(item.id);
                }
              }} activeOpacity={0.7}>
                <Ionicons name="trash-outline" size={20} color="#B91C1C" />
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1D1D1D' },
  headerCardContent: {
    margin: 16,
    marginBottom: 8,
    padding: 24,
    borderRadius: 28,
    backgroundColor: '#565656',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  topBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#424242',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  topBadgeText: {
    color: '#EAA626',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: { fontSize: 28, fontWeight: '900', color: '#F8FAFC', marginBottom: 10 },
  subtitle: { fontSize: 15, color: '#9CA3AF', lineHeight: 22 },
  overviewRow: {
    marginTop: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overviewCount: { fontSize: 32, fontWeight: '900', color: '#F8FAFC' },
  overviewLabel: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },
  clearButton: {
    backgroundColor: '#42222A',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6B3A47',
  },
  clearButtonPressed: {
    opacity: 0.85,
  },
  clearButtonText: { color: '#FF6B7A', fontWeight: '700', fontSize: 14 },
  listContent: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 8 },
  emptyState: {
    marginTop: 48,
    marginHorizontal: 2,
    backgroundColor: '#565656',
    borderRadius: 22,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 10 },
  emptyText: { textAlign: 'center', color: '#64748B', fontSize: 15, lineHeight: 22 },
  trashItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#565656',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  colorDot: { width: 8, height: 48, borderRadius: 4, marginRight: 14 },
  trashTextContainer: { flex: 1 },
  trashTitle: { fontSize: 16, fontWeight: '700', color: '#F8FAFC', marginBottom: 4 },
  trashSubtitle: { fontSize: 13, color: '#9CA3AF' },
  actionButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  restoreButton: { backgroundColor: '#ECFDF5' },
  deleteButton: { backgroundColor: '#FEE2E6' },
});
