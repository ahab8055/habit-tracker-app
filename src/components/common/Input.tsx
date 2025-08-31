import React, { useState } from 'react';
import { 
  TextInput, 
  Text, 
  View, 
  StyleSheet, 
  TextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacity 
} from 'react-native';
import { useApp } from '../../contexts/AppContext';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  isPassword?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  isPassword = false,
  ...props
}) => {
  const { getCurrentTheme } = useApp();
  const theme = getCurrentTheme();
  const [isPasswordVisible, setIsPasswordVisible] = useState(!isPassword);

  const getInputStyle = (): TextStyle => ({
    borderWidth: 1,
    borderColor: error ? theme.error : theme.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.text,
    backgroundColor: theme.background,
  });

  const getLabelStyle = (): TextStyle => ({
    fontSize: 16,
    fontWeight: '500',
    color: theme.text,
    marginBottom: 8,
  });

  const getErrorStyle = (): TextStyle => ({
    fontSize: 14,
    color: theme.error,
    marginTop: 4,
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[getLabelStyle(), labelStyle]}>{label}</Text>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={[getInputStyle(), inputStyle, isPassword && { paddingRight: 50 }]}
          secureTextEntry={!isPasswordVisible}
          placeholderTextColor={theme.textSecondary}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Text style={{ color: theme.textSecondary }}>
              {isPasswordVisible ? '👁️' : '🙈'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={getErrorStyle()}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    position: 'relative',
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Input;