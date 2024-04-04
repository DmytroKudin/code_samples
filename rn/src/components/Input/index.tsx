import {forwardRef} from 'react';
import {
  Colors,
  Input as RNEInput,
  InputProps,
  Theme,
  useTheme,
} from '@rneui/themed';
import {StyleSheet, TextInput} from 'react-native';
// import {Input as BaseInput} from '@rneui/base';

const Input = forwardRef<TextInput, InputProps>(
  ({secureTextEntry, ...props}, ref) => {
    // const inputRef = useRef<BaseInput & TextInput>(null);
    const {theme} = useTheme();
    const styles = createStyles(theme);

    return (
      <RNEInput
        {...props}
        ref={ref}
        renderErrorMessage
        placeholderTextColor={'gray'}
        secureTextEntry={secureTextEntry}
        containerStyle={styles.container}
        disabledInputStyle={styles.disabledInput}
        errorStyle={styles.error}
        inputContainerStyle={styles.inputContainer}
        inputStyle={styles.input}
        labelStyle={styles.label}
        leftIconContainerStyle={styles.leftIconContainer}
        rightIconContainerStyle={styles.rightIconContainer}
      />
    );
  },
);

const createStyles = (theme: {colors: Colors} & Theme) =>
  StyleSheet.create({
    container: {},
    disabledInput: {},
    error: {
      color: theme.colors.error,
    },
    inputContainer: {
      borderWidth: 1,
      borderRadius: 8,
      borderStyle: 'solid',
      borderColor: theme.colors.grey5,
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    input: {
      lineHeight: 20,
      fontSize: 17,
    },
    label: {
      color: theme.colors.grey0,
    },
    leftIconContainer: {},
    rightIconContainer: {},
  });

export default Input;
