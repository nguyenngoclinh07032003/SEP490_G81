import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

// --- MÀN HÌNH 1: TRANG CHỦ (Home) ---
function HomeScreen({ navigation }) {
  const categories = [
    { id: 1, name: 'Điều hòa / Máy lạnh', icon: 'snow-outline', color: '#087DEB' },
    { id: 2, name: 'Tủ lạnh & Tủ đông', icon: 'cube-outline', color: '#059669' },
    { id: 3, name: 'Máy giặt & Sấy', icon: 'shirt-outline', color: '#D97706' },
    { id: 4, name: 'Bình nóng lạnh', icon: 'flame-outline', color: '#DC2626' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Banner chào mừng */}
        <View style={styles.heroBanner}>
          <Text style={styles.heroSub}>Xin chào quý khách,</Text>
          <Text style={styles.heroTitle}>Cơ Điện Lạnh Minh Đức</Text>
          <Text style={styles.heroDesc}>Dịch vụ sửa chữa & bảo trì tại nhà chuẩn quy trình</Text>
          
          <TouchableOpacity 
            style={styles.heroBtn}
            onPress={() => navigation.navigate('Đặt lịch')}
          >
            <Text style={styles.heroBtnText}>Đặt lịch sửa chữa ngay</Text>
            <Ionicons name="arrow-forward" size={18} color="#1E293B" />
          </TouchableOpacity>
        </View>

        {/* Card Đơn đang xử lý */}
        <View style={styles.activeCard}>
          <View style={styles.activeHeader}>
            <Text style={styles.activeTag}>ĐƠN ĐANG XỬ LÝ</Text>
            <View style={styles.badgeWarning}>
              <Text style={styles.badgeText}>KTV đang đến</Text>
            </View>
          </View>
          <Text style={styles.orderCode}>Mã đơn: #REQ-2026-081</Text>
          <Text style={styles.orderDesc}>Bảo dưỡng điều hòa Daikin Inverter 12000BTU</Text>

          <View style={styles.techRow}>
            <View style={styles.techAvatar}>
              <Text style={styles.techInitial}>T</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.techName}>KTV. Trần Văn Tuấn</Text>
              <Text style={styles.techTime}>Hẹn: 14:30 - Hôm nay</Text>
            </View>
            <TouchableOpacity 
              style={styles.callBtn}
              onPress={() => Alert.alert('Gọi điện thoại', 'Đang kết nối tới KTV Trần Văn Tuấn: 0912345678')}
            >
              <Ionicons name="call" size={14} color="#15803D" />
              <Text style={styles.callBtnText}>Gọi thợ</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Danh mục thiết bị */}
        <Text style={styles.sectionTitle}>Danh mục dịch vụ sửa chữa</Text>
        <View style={styles.categoryGrid}>
          {categories.map((cat) => (
            <TouchableOpacity 
              key={cat.id} 
              style={styles.categoryCard}
              onPress={() => navigation.navigate('Đặt lịch')}
            >
              <View style={[styles.categoryIconWrap, { backgroundColor: cat.color + '15' }]}>
                <Ionicons name={cat.icon} size={28} color={cat.color} />
              </View>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Cam kết Minh Đức */}
        <View style={styles.guaranteeCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Ionicons name="shield-checkmark" size={20} color="#087DEB" />
            <Text style={styles.guaranteeTitle}>Cam kết chất lượng dịch vụ</Text>
          </View>
          <Text style={styles.guaranteeText}>• Báo giá minh bạch trước khi làm việc.</Text>
          <Text style={styles.guaranteeText}>• Bảo hành chính hãng linh kiện thay thế.</Text>
          <Text style={styles.guaranteeText}>• Kỹ thuật viên đồng phục & chuyên môn cao.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- MÀN HÌNH 2: ĐẶT LỊCH (Create Request) ---
function CreateRequestScreen({ navigation }) {
  const [device, setDevice] = useState('Điều hòa Daikin');
  const [address, setAddress] = useState('Số 45, Ngõ 120 Hoàng Quốc Việt, Cầu Giấy, Hà Nội');
  const [phone, setPhone] = useState('0987654321');
  const [desc, setDesc] = useState('');

  const handleSubmit = () => {
    Alert.alert(
      'Đặt lịch thành công!',
      'Yêu cầu của bạn đã được tiếp nhận. Đội ngũ Minh Đức sẽ liên hệ xác nhận sau ít phút.',
      [{ text: 'Xem đơn của tôi', onPress: () => navigation.navigate('Đơn của tôi') }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.formHeader}>Thông tin đặt lịch sửa chữa tại nhà</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Thiết bị cần sửa *</Text>
          <TextInput 
            style={styles.input} 
            value={device} 
            onChangeText={setDevice} 
            placeholder="Ví dụ: Điều hòa, Máy giặt..." 
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Địa chỉ phục vụ *</Text>
          <TextInput 
            style={styles.input} 
            value={address} 
            onChangeText={setAddress} 
            placeholder="Số nhà, ngõ, phường, quận..." 
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Số điện thoại liên hệ *</Text>
          <TextInput 
            style={styles.input} 
            value={phone} 
            onChangeText={setPhone} 
            keyboardType="phone-pad" 
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Mô tả triệu chứng hư hỏng</Text>
          <TextInput 
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
            value={desc} 
            onChangeText={setDesc} 
            placeholder="Ví dụ: Máy không làm lạnh, kêu to, rỉ nước..." 
            multiline 
          />
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Gửi yêu cầu sửa chữa</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- MÀN HÌNH 3: ĐƠN CỦA TÔI (My Requests) ---
function MyRequestsScreen() {
  const [isApproved, setIsApproved] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>Đơn sửa chữa của bạn</Text>

        {/* Đơn có báo giá cần duyệt */}
        <View style={styles.orderCard}>
          <View style={styles.orderCardHeader}>
            <Text style={styles.orderCardCode}>#REQ-2026-074</Text>
            <View style={isApproved ? styles.badgeSuccess : styles.badgePrimary}>
              <Text style={isApproved ? styles.badgeSuccessText : styles.badgePrimaryText}>
                {isApproved ? 'Đã duyệt giá - Đang sửa' : 'Chờ bạn duyệt báo giá'}
              </Text>
            </View>
          </View>
          <Text style={styles.orderCardTitle}>Sửa tủ lạnh Panasonic không đông đá</Text>
          <Text style={styles.orderCardAddress}>📍 Số 45, Hoàng Quốc Việt, Cầu Giấy</Text>

          {!isApproved && (
            <View style={styles.quotationBox}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.quotationLabel}>Báo giá chi tiết:</Text>
                <Text style={styles.quotationPrice}>750.000 đ</Text>
              </View>
              <Text style={styles.quotationNote}>• Công kiểm tra + Thay sò lạnh Panasonic + Nạp gas R600A</Text>

              <TouchableOpacity 
                style={styles.approveBtn}
                onPress={() => {
                  setIsApproved(true);
                  Alert.alert('Thành công', 'Bạn đã duyệt báo giá! Kỹ thuật viên sẽ bắt đầu sửa chữa.');
                }}
              >
                <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                <Text style={styles.approveBtnText}>Đồng ý duyệt báo giá</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Đơn đã hoàn tất kèm bảo hành */}
        <View style={styles.orderCard}>
          <View style={styles.orderCardHeader}>
            <Text style={styles.orderCardCode}>#REQ-2026-052</Text>
            <View style={styles.badgeSuccess}>
              <Text style={styles.badgeSuccessText}>Hoàn thành</Text>
            </View>
          </View>
          <Text style={styles.orderCardTitle}>Vệ sinh máy giặt Electrolux cửa ngang</Text>
          <Text style={styles.warrantyHighlight}>✓ Còn bảo hành 85 ngày (Hạn: 16/01/2027)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- MÀN HÌNH 4: TÀI KHOẢN (Profile) ---
function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>K</Text>
          </View>
          <Text style={styles.profileName}>Nguyễn Xuân Khánh</Text>
          <Text style={styles.profilePhone}>📞 0987654321 • khanhnx@gmail.com</Text>
        </View>

        <View style={styles.profileCard}>
          <Text style={styles.profileSectionTitle}>Địa chỉ sửa chữa mặc định</Text>
          <Text style={styles.profileAddress}>Số 45, Ngõ 120 Hoàng Quốc Việt, Cầu Giấy, Hà Nội</Text>
        </View>

        <View style={styles.profileCard}>
          <Text style={styles.profileSectionTitle}>Hỗ trợ khách hàng</Text>
          <Text style={styles.profileText}>Hotline kỹ thuật: 1900 6868</Text>
          <Text style={styles.profileText}>Cơ Điện Lạnh Minh Đức - Hà Nội</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- APP ROOT CHÍNH VỚI BOTTOM NAVIGATION ---
export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#087DEB" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: '#087DEB' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          tabBarActiveTintColor: '#087DEB',
          tabBarInactiveTintColor: '#64748B',
          tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 6 },
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Trang chủ') iconName = 'home';
            else if (route.name === 'Đặt lịch') iconName = 'add-circle';
            else if (route.name === 'Đơn của tôi') iconName = 'receipt';
            else if (route.name === 'Tài khoản') iconName = 'person';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Trang chủ" component={HomeScreen} />
        <Tab.Screen name="Đặt lịch" component={CreateRequestScreen} />
        <Tab.Screen name="Đơn của tôi" component={MyRequestsScreen} />
        <Tab.Screen name="Tài khoản" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// --- STYLESHEET CHUẨN REACT NATIVE ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  heroBanner: {
    backgroundColor: '#087DEB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  heroSub: {
    color: '#E0F2FE',
    fontSize: 13,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 2,
  },
  heroDesc: {
    color: '#BAE6FD',
    fontSize: 13,
    marginTop: 4,
  },
  heroBtn: {
    backgroundColor: '#FF9F1C',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroBtnText: {
    color: '#1E293B',
    fontWeight: 'bold',
    fontSize: 14,
  },
  activeCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    marginBottom: 20,
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeTag: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0369A1',
  },
  badgeWarning: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    color: '#B45309',
    fontWeight: 'bold',
  },
  orderCode: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 6,
  },
  orderDesc: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
  },
  techRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  techAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#087DEB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  techInitial: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  techName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  techTime: {
    fontSize: 11,
    color: '#64748B',
  },
  callBtn: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  callBtnText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
  guaranteeCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
  },
  guaranteeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#083B82',
    marginLeft: 6,
  },
  guaranteeText: {
    fontSize: 12,
    color: '#475569',
    marginTop: 3,
  },
  formHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 14,
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  submitBtn: {
    backgroundColor: '#087DEB',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
    marginBottom: 8,
  },
  orderCardCode: {
    fontWeight: 'bold',
    color: '#083B82',
    fontSize: 14,
  },
  badgePrimary: {
    backgroundColor: '#EBF4FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgePrimaryText: {
    color: '#087DEB',
    fontSize: 11,
    fontWeight: 'bold',
  },
  badgeSuccess: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeSuccessText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: 'bold',
  },
  orderCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  orderCardAddress: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  quotationBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  quotationLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#92400E',
  },
  quotationPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#B45309',
  },
  quotationNote: {
    fontSize: 12,
    color: '#78350F',
    marginTop: 4,
  },
  approveBtn: {
    backgroundColor: '#D97706',
    borderRadius: 6,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  warrantyHighlight: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '600',
    marginTop: 6,
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#087DEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  profilePhone: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  profileSectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#083B82',
    marginBottom: 4,
  },
  profileAddress: {
    fontSize: 13,
    color: '#334155',
  },
  profileText: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
  },
});
