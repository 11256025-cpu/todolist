import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTodo } from '../context/TodoContext';

export default function TrashScreen() {
  const { trashItems, restoreTodo, deleteTrashItem, emptyTrash, categories } = useTodo();

  const getCategoryName = (categoryId: string) => {
    return categories.find((category: any) => category.id === categoryId)?.name || '已刪除分類';
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
        data={trashItems}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>垃圾桶是空的</Text>
            <Text style={styles.emptyText}>沒有任何已刪除的代辦事項。</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.trashItem}>
            <View style={[styles.colorDot, { backgroundColor: item.color || '#8B5CF6' }]} />
            <View style={styles.trashTextContainer}>
              <Text style={styles.trashTitle}>{item.text}</Text>
              <Text style={styles.trashSubtitle}>{getCategoryName(item.categoryId)}</Text>
            </View>
            <TouchableOpacity style={[styles.actionButton, styles.restoreButton]} onPress={() => confirmRestore(item)} activeOpacity={0.7}>
              <Ionicons name="arrow-undo-outline" size={20} color="#047857" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => confirmDeletePermanent(item.id)} activeOpacity={0.7}>
              <Ionicons name="trash-outline" size={20} color="#B91C1C" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FB' },
  headerCardContent: {
    margin: 16,
    marginBottom: 8,
    padding: 24,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  topBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  topBadgeText: {
    color: '#3730A3',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: { fontSize: 28, fontWeight: '900', color: '#111827', marginBottom: 10 },
  subtitle: { fontSize: 15, color: '#6B7280', lineHeight: 22 },
  overviewRow: {
    marginTop: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overviewCount: { fontSize: 32, fontWeight: '900', color: '#0F172A' },
  overviewLabel: { fontSize: 13, color: '#64748B', marginTop: 4 },
  clearButton: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  clearButtonPressed: {
    opacity: 0.85,
  },
  clearButtonText: { color: '#B91C1C', fontWeight: '700', fontSize: 14 },
  listContent: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 8 },
  emptyState: {
    marginTop: 48,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 10 },
  emptyText: { textAlign: 'center', color: '#64748B', fontSize: 15, lineHeight: 22 },
  trashItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  colorDot: { width: 10, height: 50, borderRadius: 6, marginRight: 16 },
  trashTextContainer: { flex: 1 },
  trashTitle: { fontSize: 17, fontWeight: '800', color: '#111827', marginBottom: 6 },
  trashSubtitle: { fontSize: 13, color: '#64748B' },
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
