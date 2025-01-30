import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

interface RoleTabsProps {
  userRole: string;
  setUserRole: React.Dispatch<React.SetStateAction<string | null>>;
}

const RoleTabs: React.FC<RoleTabsProps> = ({userRole, setUserRole}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, userRole === 'student' && styles.activeTab]}
        onPress={() => setUserRole('student')}>
        <Text
          style={[
            styles.tabText,
            userRole === 'student' && styles.activeTabText,
          ]}>
          Student
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, userRole === 'faculty' && styles.activeTab]}
        onPress={() => setUserRole('faculty')}>
        <Text
          style={[
            styles.tabText,
            userRole === 'faculty' && styles.activeTabText,
          ]}>
          Faculty
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007bff',
  },
  activeTab: {
    backgroundColor: '#007bff',
  },
  tabText: {
    color: '#007bff',
  },
  activeTabText: {
    color: '#ffffff',
  },
});

export default RoleTabs;
